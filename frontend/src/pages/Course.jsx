// src/pages/Course.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Play,
  Clock,
  CheckCircle2,
  Circle,
  BookOpen,
  Users,
  Star,
  Trophy,
  ArrowLeft,
  Download,
  Share2,
} from "lucide-react";

/**
 * Course page (full, defensive)
 * - tries backend at http://127.0.0.1:8000
 * - falls back to in-file MOCK data when backend unreachable
 * - works with /course and /course/:id (defaults to id=1)
 * - defensive checks everywhere (no more `... of undefined` crashes)
 */

/* ----------------------------- MOCK DATA ----------------------------- */
const MOCK = {
  course: {
    id: 1,
    title: "Advanced React Development",
    description:
      "Master modern React patterns, hooks, performance optimization, and build production-ready applications with confidence.",
    instructor: "Sarah Chen",
    duration: "8 weeks",
    level: "Advanced",
    rating: 4.8,
    students: 1247,
    image:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1600&h=800&fit=crop&q=80",
    progress: 65,
    is_premium: false,
  },
  lessons: [
    { id: 1, title: "Introduction to Advanced Patterns", order_index: 1, completed: true, duration: "15 min", quiz_id: 1 },
    { id: 2, title: "Custom Hooks Deep Dive", order_index: 2, completed: true, duration: "22 min", quiz_id: 2 },
    { id: 3, title: "Context API & State Management", order_index: 3, completed: true, duration: "18 min", quiz_id: null },
    { id: 4, title: "Performance Optimization", order_index: 4, completed: false, duration: "25 min", quiz_id: 3 },
    { id: 5, title: "Testing React Components", order_index: 5, completed: false, duration: "20 min", quiz_id: 4 },
    { id: 6, title: "Deployment Strategies", order_index: 6, completed: false, duration: "12 min", quiz_id: null },
  ],
};

/* --------------------------- fetch helper ----------------------------- */
async function fetchFromBackendOrMock(path, timeout = 3500) {
  const base = "http://127.0.0.1:8000";
  try {
    const res = await axios.get(`${base}${path}`, { timeout });
    return res.data;
  } catch (err) {
    // backend failed (CORS, down, etc.) → return mock safely after small delay
    await new Promise((r) => setTimeout(r, 200));
    if (path.endsWith("/lessons")) return MOCK.lessons;
    if (path.match(/^\/courses\/\d+$/)) return MOCK.course;
    return null;
  }
}

/* ---------------------------- Course Component ----------------------- */
export default function Course() {
  // supports /course and /course/:id
  const { id } = useParams();
  const navigate = useNavigate();
  const courseId = Number(id || 1);

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setErrorMsg("");
      try {
        const [courseData, lessonsData] = await Promise.all([
          fetchFromBackendOrMock(`/courses/${courseId}`),
          fetchFromBackendOrMock(`/courses/${courseId}/lessons`),
        ]);

        if (!mounted) return;

        setCourse(courseData && typeof courseData === "object" ? courseData : MOCK.course);
        setLessons(Array.isArray(lessonsData) ? lessonsData : MOCK.lessons);
      } catch (err) {
        console.error("Course load error:", err);
        if (!mounted) return;
        setErrorMsg("Failed to load course — showing demo data.");
        setCourse(MOCK.course);
        setLessons(MOCK.lessons);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [courseId]);

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading your course...</p>
        </div>
      </div>
    );
  }

  // Defensive: if course still null
  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-bold text-white mb-2">Course not found</h2>
          <p className="text-white/70">The course you're looking for doesn't exist.</p>
          {errorMsg && <p className="text-red-300 mt-3">{errorMsg}</p>}
        </div>
      </div>
    );
  }

  // Safe derived values
  const safeLessons = Array.isArray(lessons) ? lessons : [];
  const completedLessons = safeLessons.filter((l) => l && Boolean(l.completed)).length;
  const totalLessons = safeLessons.length;
  const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // Safe instructor initials (handles missing instructor string)
  const instructorName = typeof course.instructor === "string" && course.instructor.trim() ? course.instructor : "Instructor";
  const instructorInitials = instructorName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 3)
    .join("");

  // safe students number
  const studentsDisplay = typeof course.students === "number" ? course.students.toLocaleString() : (course.students ?? "—");

  // start/continue button behavior
  const nextIncomplete = safeLessons.find((l) => !l.completed)?.id ?? (safeLessons[0]?.id ?? null);

  function handleStartCourse() {
    if (!course) return;
    if (course.is_premium) {
      navigate(`/subscribe?course=${course.id}`);
      return;
    }
    if (nextIncomplete) navigate(`/lesson/${nextIncomplete}`);
    else navigate(`/course/${course.id}`);
  }

  function goToQuiz(quizId) {
    if (!quizId) return;
    navigate(`/quiz/${quizId}`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50">
        <div className="w-full px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white">{course.title ?? "Untitled Course"}</h1>
              <p className="text-sm text-white/70">Progress: {completedLessons}/{totalLessons} lessons</p>
            </div>
            <div className="flex gap-2">
              <button className="p-3 hover:bg-white/10 rounded-xl transition-colors" aria-label="share">
                <Share2 className="w-5 h-5 text-white/70" />
              </button>
              <button className="p-3 hover:bg-white/10 rounded-xl transition-colors" aria-label="download">
                <Download className="w-5 h-5 text-white/70" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Page content */}
      <div className="w-full px-6 py-10">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-4 gap-8">
          {/* Main */}
          <div className="lg:col-span-3 space-y-8">
            {/* Hero */}
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/10">
              <div
                className="h-96 relative overflow-hidden"
                style={{
                  backgroundImage: course.image ? `linear-gradient(45deg, rgba(59,130,246,0.85), rgba(147,51,234,0.85)), url(${course.image})` : undefined,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-8 left-8 right-8 text-white">
                  <h2 className="text-4xl font-bold mb-4">{course.title}</h2>
                  <p className="text-white/90 max-w-3xl text-lg leading-relaxed">{course.description}</p>
                </div>
              </div>

              <div className="p-8 bg-white/5">
                <div className="flex flex-wrap items-center gap-8 text-sm">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-400" />
                    <span className="text-white/80">{course.level ?? course.difficulty ?? "—"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-400" />
                    <span className="text-white/80">{course.duration ?? "—"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-400" />
                    <span className="text-white/80">{studentsDisplay} students</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="text-white/80">{course.rating ?? "—"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="bg-white/5 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Your Progress</h3>
                <div className="flex items-center gap-3 text-blue-400">
                  <Trophy className="w-6 h-6" />
                  <span className="font-semibold">{progressPercentage}% Complete</span>
                </div>
              </div>

              <div className="w-full bg-white/10 rounded-full h-4 mb-3">
                <div
                  className="bg-gradient-to-r from-blue-400 to-purple-400 h-4 rounded-full transition-all duration-800 relative overflow-hidden"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>

              <div className="flex justify-between text-sm text-white/70">
                <span>{completedLessons} lessons completed</span>
                <span>{totalLessons - completedLessons} lessons remaining</span>
              </div>
            </div>

            {/* Lessons */}
            <div className="bg-white/5 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/10">
              <div className="p-8 border-b border-white/10 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white">Course Lessons</h3>
                  <p className="text-white/70 mt-2">Click on any lesson to continue your learning journey</p>
                </div>

                <div>
                  <button
                    onClick={handleStartCourse}
                    className={`px-6 py-3 rounded-full font-semibold transition ${
                      course.is_premium ? "bg-amber-400 text-black hover:bg-amber-500" : "bg-emerald-500 text-white hover:bg-emerald-600"
                    }`}
                  >
                    {course.is_premium ? "Subscribe to Access" : (completedLessons > 0 ? "Continue Course" : "Start Course")}
                  </button>
                </div>
              </div>

              <div className="divide-y divide-white/10">
                {safeLessons.map((lesson) => (
                  <div key={lesson.id} className={`p-6 md:p-8 hover:bg-white/5 transition-all duration-200 group ${lesson.completed ? "bg-green-500/10" : ""}`}>
                    <div className="flex items-center gap-6">
                      <div className="flex-shrink-0">
                        {lesson.completed ? (
                          <CheckCircle2 className="w-7 h-7 text-green-400" />
                        ) : (
                          <Circle className="w-7 h-7 text-white/30 group-hover:text-blue-400 transition-colors" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <Link to={`/lesson/${lesson.id}`} className="block">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="text-white text-lg font-semibold group-hover:text-blue-400 transition-colors">
                                {lesson.order_index}. {lesson.title}
                              </h4>
                              <div className="mt-2 text-sm text-white/60 flex items-center gap-4">
                                <span className="inline-flex items-center gap-2">
                                  <Clock className="w-4 h-4" />
                                  <span>{lesson.duration ?? "—"}</span>
                                </span>
                                {lesson.completed && <span className="text-green-400 font-medium">Completed</span>}
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              {lesson.quiz_id && (
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    goToQuiz(lesson.quiz_id);
                                  }}
                                  className="px-5 py-2 bg-purple-500/20 text-purple-300 rounded-xl hover:bg-purple-500/30 transition-colors font-medium border border-purple-400/20"
                                >
                                  Take Quiz
                                </button>
                              )}
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity p-2">
                                <Play className="w-5 h-5 text-blue-400" />
                              </div>
                            </div>
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}

                {safeLessons.length === 0 && <div className="p-6 text-center text-white/70">No lessons for this course yet.</div>}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-3xl shadow-2xl p-6 border border-white/10">
              <h4 className="text-lg font-bold text-white mb-4">Your Instructor</h4>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-lg font-bold">
                  {instructorInitials}
                </div>
                <div>
                  <div className="text-white font-semibold">{instructorName}</div>
                  <div className="text-white/60 text-sm">Senior Instructor</div>
                  <div className="flex items-center gap-2 mt-2 text-white/70">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm">4.9 instructor rating</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-3xl shadow-2xl p-6 border border-white/10">
              <h4 className="text-lg font-bold text-white mb-4">Quick Stats</h4>
              <div className="space-y-3 text-white/80 text-sm">
                <div className="flex justify-between">
                  <span>Total Lessons</span>
                  <strong>{totalLessons}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Completed</span>
                  <strong className="text-green-400">{completedLessons}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Remaining</span>
                  <strong className="text-blue-300">{totalLessons - completedLessons}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Progress</span>
                  <strong className="text-purple-300">{progressPercentage}%</strong>
                </div>
              </div>
            </div>

            {progressPercentage > 50 && (
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl p-6 text-white border border-yellow-400/20">
                <div className="text-center">
                  <Trophy className="w-12 h-12 mx-auto mb-3" />
                  <h5 className="font-bold text-lg mb-1">Halfway There! 🎉</h5>
                  <p className="text-white/90 text-sm">You're making excellent progress. Keep it up!</p>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
