// src/pages/Quiz.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api";
import { CheckCircle } from "lucide-react";

/**
 * Quiz page:
 * - uses `api` axios instance
 * - defensive about backend shape
 * - confirmation modal for incomplete submission
 * - auto-mark lesson complete on pass (if backend permits)
 */

export default function Quiz() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [autoCompleteStatus, setAutoCompleteStatus] = useState(null);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    setQuiz(null);
    setAnswers([]);
    setResult(null);
    setAutoCompleteStatus(null);

    api
      .get(`/quizzes/${id}`)
      .then((res) => {
        if (!mounted) return;
        const data = res.data ?? {};
        // ensure questions array exists so UI doesn't crash
        data.questions = Array.isArray(data.questions) ? data.questions : [];
        setQuiz(data);
        setAnswers(new Array(data.questions.length).fill(-1));
      })
      .catch((err) => {
        console.error("Failed to load quiz:", err);
        setError(err.details?.detail ?? err.message ?? "Could not load quiz.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => (mounted = false);
  }, [id]);

  const choose = (qidx, optIdx) => {
    const next = [...answers];
    next[qidx] = optIdx;
    setAnswers(next);
  };

  const totalQuestions = quiz ? quiz.questions.length : 0;
  const answeredCount = answers.filter((a) => a >= 0).length;
  const allAnswered = totalQuestions > 0 && answeredCount === totalQuestions;
  const progressPercent = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  const handleSubmit = async () => {
    // show confirm modal when incomplete
    if (!allAnswered) {
      setShowConfirmSubmit(true);
      return;
    }

    setSubmitting(true);
    setError(null);
    setResult(null);
    setAutoCompleteStatus(null);

    try {
      const res = await api.post(`/quizzes/${id}/submit`, { answers });
      const data = res.data ?? {};
      const normalized = {
        score: data.score ?? data.score_percent ?? 0,
        passed: !!data.passed,
        correct: data.correct ?? 0,
        total: data.total ?? totalQuestions,
        next_lesson_id: data.next_lesson_id ?? null,
        attempt_id: data.attempt_id ?? data.id ?? null,
      };
      setResult(normalized);

      // if passed and quiz has lesson_id, attempt to mark lesson complete
      if (normalized.passed && quiz?.lesson_id) {
        try {
          await api.post(`/lessons/${quiz.lesson_id}/complete`, {});
          setAutoCompleteStatus("done");
        } catch (err) {
          console.error("Auto-complete failed:", err);
          setAutoCompleteStatus("failed");
        }
      }
    } catch (err) {
      console.error("Submit failed:", err);
      setError(err.details?.detail ?? err.message ?? "Submit failed — try again.");
    } finally {
      setSubmitting(false);
      setShowConfirmSubmit(false);
    }
  };

  const handleReset = () => {
    if (!quiz) return;
    setAnswers(new Array(quiz.questions.length).fill(-1));
    setResult(null);
    setAutoCompleteStatus(null);
    setError(null);
  };

  const goToNextLesson = () => {
    const serverNext = result?.next_lesson_id ?? null;
    const heuristicNext = quiz?.lesson_id ? quiz.lesson_id + 1 : null;
    const nextId = serverNext || heuristicNext;
    if (nextId) navigate(`/lesson/${nextId}`);
    else navigate("/course");
  };

  const getChoiceClass = (qi, oi, disabled) => {
    const selected = answers[qi] === oi;
    const base = "text-left w-full p-4 rounded-xl transition-all duration-200 border-2 font-medium";

    if (disabled) {
      if (selected) return `${base} bg-blue-900/50 border-blue-600 text-blue-200`;
      return `${base} bg-slate-700/50 border-slate-600 text-slate-400`;
    }
    if (selected) return `${base} bg-blue-600 border-blue-500 text-white shadow-lg transform scale-[1.02]`;
    return `${base} bg-slate-700/70 border-slate-600 text-slate-200 hover:border-blue-400 hover:bg-slate-600/70`;
  };

  // --- render states ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error && !quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700 p-8 text-center">
          <div className="w-16 h-16 bg-red-900/50 border border-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Error Loading Quiz</h3>
          <p className="text-red-300 mb-6">{error}</p>
          <Link to="/course" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            ← Back to Course
          </Link>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700 p-8 text-center">
          <h3 className="text-lg font-semibold text-white mb-2">Quiz Not Found</h3>
          <p className="text-slate-300 mb-6">The quiz you're looking for doesn't exist.</p>
          <Link to="/course" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            ← Back to Course
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900">
      {/* Header */}
      <div className="bg-slate-800/90 backdrop-blur-sm shadow-lg sticky top-0 z-10 border-b border-slate-700">
        <div className="w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/course" className="text-gray-400 hover:text-gray-200 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-white">{quiz.title}</h1>
                <p className="text-sm text-slate-300">Pass required: {quiz.pass_percent ?? 60}%</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-slate-300">
                {answeredCount} of {totalQuestions} answered
              </div>
              <Link to="/progress" className="text-sm text-blue-400 hover:text-blue-300 font-medium">Progress</Link>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
              <span>Progress</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div style={{ width: `${progressPercent}%` }} className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out" />
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="w-full px-6 py-8">
        <div className="space-y-8 max-w-4xl mx-auto">
          {quiz.questions.map((q, qi) => (
            <div key={q.id ?? qi} className="bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700 p-6">
              <div className="flex items-start space-x-3 mb-4">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${answers[qi] >= 0 ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                  {qi + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-white leading-relaxed">{q.text}</h3>
                </div>
              </div>

              <div className="space-y-3 ml-11">
                {(q.choices || []).map((ch, oi) => {
                  const disabled = !!result;
                  return (
                    <button
                      key={oi}
                      onClick={() => !disabled && choose(qi, oi)}
                      className={getChoiceClass(qi, oi, disabled)}
                      disabled={disabled}
                      type="button"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full border-2 ${answers[qi] === oi ? 'border-white bg-white' : 'border-slate-400'}`}>
                          {answers[qi] === oi && <div className="w-2 h-2 bg-blue-600 rounded-full mx-auto mt-0.5" />}
                        </div>
                        <span>{ch}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="mt-8 max-w-4xl mx-auto">
          <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {!result ? (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className={`px-6 py-3 rounded-lg font-medium transition-all ${
                      allAnswered && !submitting
                        ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg'
                        : submitting
                          ? 'bg-green-600 text-white opacity-75 cursor-wait'
                          : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                    }`}
                  >
                    {submitting ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Submitting...</span>
                      </div>
                    ) : allAnswered ? (
                      'Submit Quiz'
                    ) : (
                      `Submit Anyway (${answeredCount}/${totalQuestions})`
                    )}
                  </button>
                ) : (
                  <button onClick={handleReset} className="px-6 py-3 rounded-lg bg-gray-600 hover:bg-gray-700 text-white font-medium transition-colors">
                    Try Again
                  </button>
                )}
              </div>

              {!allAnswered && !result && (
                <div className="text-sm text-amber-400 bg-amber-900/20 border border-amber-700 px-3 py-2 rounded-lg">
                  {totalQuestions - answeredCount} questions remaining
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Confirm modal */}
        {showConfirmSubmit && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-xl max-w-md w-full p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-2">Submit Incomplete Quiz?</h3>
              <p className="text-slate-300 mb-4">
                You have {totalQuestions - answeredCount} unanswered questions. Are you sure you want to submit?
              </p>
              <div className="flex space-x-3">
                <button onClick={() => setShowConfirmSubmit(false)} className="flex-1 px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700">
                  Continue Quiz
                </button>
                <button
                  onClick={() => {
                    setShowConfirmSubmit(false);
                    handleSubmit();
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Submit Anyway
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="mt-8 max-w-4xl mx-auto">
            <div className={`rounded-xl shadow-xl backdrop-blur-sm p-8 border ${result.passed ? 'bg-green-900/30 border-green-600/50' : 'bg-red-900/30 border-red-600/50'}`}>
              <div className="text-center mb-6">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${result.passed ? 'bg-green-800/50 border border-green-600' : 'bg-red-800/50 border border-red-600'}`}>
                  {result.passed ? (
                    <CheckCircle className="w-10 h-10 text-green-400" />
                  ) : (
                    <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  )}
                </div>

                <h2 className={`text-2xl font-bold mb-2 ${result.passed ? 'text-green-300' : 'text-red-300'}`}>
                  {result.passed ? 'Quiz Passed!' : 'Quiz Failed'}
                </h2>

                <div className="text-3xl font-bold mb-2 text-white">{result.score}%</div>
                <p className="text-slate-300">{result.correct} out of {result.total} questions correct</p>
                {result.attempt_id && <p className="text-xs text-slate-500 mt-2">Attempt ID: {result.attempt_id}</p>}
              </div>

              {result.passed && quiz?.lesson_id && (
                <div className="mb-6 text-center">
                  {autoCompleteStatus === "done" && (
                    <div className="inline-flex items-center px-4 py-2 bg-green-800/40 text-green-300 border border-green-600 rounded-full text-sm">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Lesson automatically marked complete
                    </div>
                  )}
                  {autoCompleteStatus === "failed" && (
                    <div className="inline-flex items-center px-4 py-2 bg-yellow-800/40 text-yellow-300 border border-yellow-600 rounded-full text-sm">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                      </svg>
                      Lesson passed but auto-complete failed
                    </div>
                  )}
                  {autoCompleteStatus === null && (
                    <div className="inline-flex items-center px-4 py-2 bg-blue-800/40 text-blue-300 border border-blue-600 rounded-full text-sm">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400 mr-2"></div>
                      Marking lesson complete...
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-wrap gap-3 justify-center">
                {result.passed && (result.next_lesson_id || quiz?.lesson_id) && (
                  <button onClick={goToNextLesson} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2">
                    <span>Next Lesson</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </button>
                )}

                <Link to="/progress" className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors inline-flex items-center border border-slate-600">
                  View Progress
                </Link>

                <Link to="/course" className="px-6 py-3 border border-slate-500 text-slate-300 hover:bg-slate-800 rounded-lg font-medium transition-colors inline-flex items-center">
                  Back to Course
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
