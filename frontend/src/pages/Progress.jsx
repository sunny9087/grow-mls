// src/pages/Progress.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function Progress() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lessonsCompleted, setLessonsCompleted] = useState([]);
  const [quizAttempts, setQuizAttempts] = useState([]);

  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchProgress = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("http://127.0.0.1:8000/users/me/progress", {
        headers: getAuthHeader(),
      });
      // expected shape: { lessons_completed: [{lesson_id, completed_at}], quiz_attempts: [...] }
      setLessonsCompleted(res.data.lessons_completed || []);
      setQuizAttempts(res.data.quiz_attempts || []);
    } catch (err) {
      console.error("Failed to fetch progress:", err);
      setError(
        err?.response?.data?.detail ||
          "Could not load progress. Are you logged in and is the backend running?"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  const formatDate = (iso) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      return d.toLocaleString();
    } catch {
      return iso;
    }
  };

  if (loading) return <div className="p-6">Loading progress…</div>;

  if (error)
    return (
      <div className="p-6">
        <div className="text-red-400 mb-4">{error}</div>
        <div>
          <Link to="/course" className="text-indigo-400">
            ← Back to course
          </Link>
        </div>
      </div>
    );

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Your Progress</h1>
          <div className="text-sm text-slate-400">Completed lessons and quiz attempts</div>
        </div>

        <div className="flex gap-2 items-center">
          <button
            onClick={fetchProgress}
            className="px-3 py-2 rounded bg-slate-600 text-white"
          >
            Refresh
          </button>
          <Link to="/course" className="text-indigo-400">
            Back to course
          </Link>
        </div>
      </div>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Lessons completed</h2>
        {lessonsCompleted.length === 0 ? (
          <div className="card">No lessons completed yet — try a quiz or mark a lesson complete.</div>
        ) : (
          <div className="space-y-3">
            {lessonsCompleted.map((p) => (
              <div key={p.lesson_id} className="card flex items-center justify-between">
                <div>
                  <div className="font-medium">Lesson ID: {p.lesson_id}</div>
                  <div className="text-sm text-slate-400">Completed at: {formatDate(p.completed_at)}</div>
                </div>
                <div className="flex gap-2 items-center">
                  <Link to={`/lesson/${p.lesson_id}`} className="px-3 py-2 rounded bg-indigo-600 text-white">
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Quiz attempts</h2>
        {quizAttempts.length === 0 ? (
          <div className="card">No quiz attempts yet.</div>
        ) : (
          <div className="space-y-3">
            {quizAttempts.map((a) => (
              <div key={a.id} className="card">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">Quiz ID: {a.quiz_id} — Score: {a.score}%</div>
                    <div className="text-sm text-slate-400">
                      {a.passed ? <span className="text-green-400">Passed</span> : <span className="text-red-400">Failed</span>} • Attempted at: {formatDate(a.attempted_at)}
                    </div>
                    {a.answers && Array.isArray(a.answers) && (
                      <div className="mt-2 text-sm">
                        <strong>Answers:</strong> {a.answers.join(", ")}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Link to={`/quiz/${a.quiz_id}`} className="px-3 py-2 rounded bg-blue-600 text-white">
                      View Quiz
                    </Link>
                    {/* If the quiz is linked to a lesson, allow going to that lesson (frontend will fetch if needed) */}
                    <Link to={`/lesson/${a.quiz_id}`} className="px-3 py-2 rounded bg-slate-600 text-white">
                      (jump)
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
