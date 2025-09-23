// src/pages/Lesson.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  CheckCircle2,
  Play,
  BookOpen,
  Clock,
  MessageSquare,
} from "lucide-react";

/**
 * Lesson page
 * - Fetches /lessons/:id
 * - Displays content (supports simple HTML)
 * - Mark complete (POST /lessons/:id/complete)
 * - If quiz_id present, shows "Take Quiz" button
 *
 * Defensive: falls back to demo data when backend fails.
 */

const DEMO_LESSON = {
  id: 1,
  title: "What is Investing?",
  content:
    "<p>Investing means allocating money with the expectation of a future return. Unlike saving, which preserves capital, investing puts your money to work to grow over time through appreciation, dividends, or interest.</p><p>This demo lesson shows how the real lesson will look when loaded from the server.</p>",
  order_index: 1,
  quiz_id: null,
  duration: "12 min",
};

export default function Lesson() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    async function loadLesson() {
      setLoading(true);
      setError(null);

      try {
        // use your backend base URL if different
        const res = await axios.get(`http://127.0.0.1:8000/lessons/${id}`, {
          timeout: 5000,
        });

        // expected res.data shape: { id, title, content, order_index, quiz_id, ...}
        if (mountedRef.current) {
          setLesson(res.data);
        }
      } catch (err) {
        console.warn("Failed to load lesson from backend:", err?.message || err);
        // defensive fallback to demo lesson
        if (mountedRef.current) {
          setLesson({ ...DEMO_LESSON, id: Number(id) || DEMO_LESSON.id });
          setError(
            "Could not load lesson from server — showing demo content. Check backend routes/CORS."
          );
        }
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    }

    loadLesson();
    return () => {
      mountedRef.current = false;
    };
  }, [id]);

  const handleMarkComplete = async () => {
    if (!lesson?.id) return;
    setMarking(true);

    try {
      // optimistic update: mark as completed immediately in UI
      setLesson((prev) => ({ ...prev, completed: true }));

      await axios.post(
        `http://127.0.0.1:8000/lessons/${lesson.id}/complete`,
        {},
        { timeout: 5000 }
      );
      // if success -> keep completed true
    } catch (err) {
      console.error("Mark complete failed:", err?.message || err);
      // revert optimistic if server returns error
      setLesson((prev) => ({ ...prev, completed: false }));
      // convert common errors into friendly messages
      if (err?.response?.status === 403) {
        setError("Subscription required to complete this lesson. Try subscribing or login.");
      } else {
        setError("Could not mark lesson as complete. Try again.");
      }
    } finally {
      setMarking(false);
    }
  };

  const openQuiz = () => {
    if (lesson?.quiz_id) navigate(`/quiz/${lesson.quiz_id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold">Lesson not found</h2>
          <p className="mt-2 text-white/70">Check the course page or select another lesson.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white">
      {/* Sticky header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => window.history.back()}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold">{lesson.title}</h1>
            <div className="text-sm text-white/70 flex items-center gap-3">
              <div className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                <span>{lesson.order_index ? `Lesson ${lesson.order_index}` : "Lesson"}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{lesson.duration ?? "—"}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={openQuiz}
              disabled={!lesson.quiz_id}
              className={`px-4 py-2 rounded-2xl border ${
                lesson.quiz_id ? "bg-purple-600/90 hover:scale-[1.02]" : "opacity-40 cursor-not-allowed"
              } transition transform`}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm font-semibold">Quiz</span>
              </div>
            </button>

            <button
              onClick={handleMarkComplete}
              disabled={marking || !!lesson.completed}
              className={`px-4 py-2 rounded-2xl border ${
                lesson.completed
                  ? "bg-green-500/80 text-white"
                  : "bg-white/5 hover:bg-white/10 text-white"
              } transition`}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-semibold">
                  {lesson.completed ? "Completed" : marking ? "Marking..." : "Mark Complete"}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Page body */}
      <div className="max-w-5xl mx-auto px-6 py-10 grid lg:grid-cols-3 gap-8">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Optional video area (if lesson.video_url) */}
          {lesson.video_url ? (
            <div className="rounded-3xl overflow-hidden bg-black/30">
              {/* simple responsive iframe */}
              <div className="aspect-video">
                <iframe
                  title="lesson-video"
                  src={lesson.video_url}
                  className="w-full h-full block"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          ) : (
            <div className="rounded-3xl bg-white/5 p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <Play className="w-6 h-6 text-blue-400" />
                <h2 className="text-xl font-semibold">Lesson Content</h2>
              </div>
              {/* render HTML content safely (we assume backend produces safe HTML) */}
              <div
                className="prose prose-invert text-white/90 max-w-none"
                dangerouslySetInnerHTML={{ __html: lesson.content || "<p>No content</p>" }}
              />
            </div>
          )}

          {/* Comments / Discussion stub */}
          <div className="rounded-3xl bg-white/5 p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-white/80" />
                <h3 className="text-lg font-semibold">Discussion</h3>
              </div>
              <div className="text-sm text-white/70">Be kind — this is a demo</div>
            </div>

            <div className="text-white/70">
              <p>No comments yet. In a full app this area would show/allow comments and questions.</p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="rounded-3xl bg-white/5 p-6 border border-white/10">
            <h4 className="font-semibold mb-2">Lesson Info</h4>
            <div className="text-sm text-white/70 space-y-2">
              <div className="flex justify-between">
                <span>Lesson</span>
                <span>#{lesson.order_index ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span>Duration</span>
                <span>{lesson.duration ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span>Status</span>
                <span>{lesson.completed ? "Completed" : "Not completed"}</span>
              </div>
              <div className="flex justify-between">
                <span>Quiz</span>
                <span>{lesson.quiz_id ? "Available" : "None"}</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white/5 p-6 border border-white/10">
            <h4 className="font-semibold mb-2">What next?</h4>
            <div className="text-sm text-white/70 space-y-3">
              <p>
                Complete this lesson and try the quiz (if available). Your progress will be saved for
                the demo user.
              </p>
              <button
                onClick={() => window.history.back()}
                className="w-full px-4 py-2 rounded-2xl bg-white/6 hover:bg-white/10"
              >
                Back to course
              </button>
            </div>
          </div>
        </aside>
      </div>

      {error && (
        <div className="fixed right-6 bottom-6 z-50 max-w-md">
          <div className="rounded-lg bg-amber-600/95 text-white p-4 shadow-lg">
            <div className="font-semibold">Notice</div>
            <div className="text-sm mt-1">{error}</div>
            <div className="text-xs text-white/90 mt-2">Check backend & CORS configuration if persistent.</div>
          </div>
        </div>
      )}
    </div>
  );
}
