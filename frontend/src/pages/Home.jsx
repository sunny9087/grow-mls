// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api"; // <-- use your Vite-friendly axios instance

// icons (lucide-react)
import {
  TrendingUp,
  BookOpen,
  Award,
  Users,
  Star,
  ArrowRight,
  Play,
  Target,
  BarChart3,
  Shield,
  Sparkles,
  ChevronRight,
  Clock,
  Phone,
  Mail,
  Github,
  Linkedin,
  User,
  Crown,
  Zap,
  Globe,
  CheckCircle,
  // extra icons used below
  Search,
  Filter,
  ExternalLink,
} from "lucide-react";

/* ------------------------------
   Demo data & small helpers
   ------------------------------ */
const DEMO_COURSES = [
  {
    id: 1,
    title: "Stock Market Fundamentals",
    description:
      "Master the essentials of stock investing with real-world case studies and hands-on portfolio building exercises.",
    lessons: 12,
    duration: "3.5 hours",
    difficulty: "Beginner",
    students: 2847,
    rating: 4.8,
    progress: 0,
    category: "Stocks",
    instructor: "Sarah Chen",
    price: "Free",
    trending: true,
    completionRate: 94,
    is_premium: false,
  },
  {
    id: 2,
    title: "Cryptocurrency Deep Dive",
    description:
      "Navigate the complex world of digital assets, DeFi protocols, and blockchain technology with confidence.",
    lessons: 18,
    duration: "5.2 hours",
    difficulty: "Intermediate",
    students: 1923,
    rating: 4.9,
    progress: 45,
    category: "Crypto",
    instructor: "Alex Rodriguez",
    price: "₹5,000",
    trending: false,
    completionRate: 87,
    is_premium: true,
  },
  {
    id: 3,
    title: "Portfolio Optimization",
    description:
      "Build diversified investment portfolios using modern portfolio theory and risk management strategies.",
    lessons: 15,
    duration: "4.8 hours",
    difficulty: "Advanced",
    students: 1456,
    rating: 4.7,
    progress: 20,
    category: "Portfolio",
    instructor: "Michael Park",
    price: "₹5,000",
    trending: false,
    completionRate: 91,
    is_premium: true,
  },
  {
    id: 4,
    title: "Options Trading Mastery",
    description:
      "Advanced options strategies, risk management, and market psychology for sophisticated investors.",
    lessons: 22,
    duration: "6.5 hours",
    difficulty: "Expert",
    students: 987,
    rating: 4.6,
    progress: 0,
    category: "Options",
    instructor: "Jennifer Liu",
    price: "₹1,000/year",
    trending: true,
    completionRate: 82,
    is_premium: true,
  },
];

const stats = [
  { icon: Users, value: "50K+", label: "Active Learners", color: "from-blue-500 to-cyan-500" },
  { icon: BookOpen, value: "200+", label: "Expert Courses", color: "from-emerald-500 to-teal-500" },
  { icon: Award, value: "98%", label: "Success Rate", color: "from-purple-500 to-pink-500" },
  { icon: Star, value: "4.9★", label: "Average Rating", color: "from-amber-500 to-orange-500" },
];

const difficultyColors = {
  Beginner: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  Intermediate: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  Advanced: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  Expert: "bg-red-500/20 text-red-300 border-red-500/30"
};

function safeNumber(v, fallback = 0) {
  return typeof v === "number" ? v : fallback;
}
function safeLocale(v) {
  const n = safeNumber(v, 0);
  try {
    return n.toLocaleString();
  } catch {
    return String(n);
  }
}

/* ------------------------------
   Component
   ------------------------------ */
export default function Home({ onStartCourse } = {}) {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const navigate = useNavigate();

  // Compute categories safely (watch empty courses)
  const categories = React.useMemo(() => {
    const cats = (courses || []).map(course => course.category).filter(Boolean);
    return ["All", ...Array.from(new Set(cats))];
  }, [courses]);

  // Filter courses based on search and category
  const filteredCourses = courses.filter(course => {
    const matchesSearch =
      (course.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.description || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    let mounted = true;
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.get("/courses"); // uses baseURL from src/api.js
        if (!mounted) return;
        // Accept array response OR object with .courses - be tolerant
        const data = Array.isArray(res.data) ? res.data : (res.data?.courses || []);
        if (Array.isArray(data) && data.length > 0) {
          const normalized = data.map((c) => ({
            id: c.id,
            title: c.title ?? "Untitled",
            description: c.description ?? "",
            lessons: c.lessons ?? 0,
            duration: c.duration ?? "—",
            difficulty: c.difficulty ?? "Beginner",
            students: typeof c.students === "number" ? c.students : 0,
            rating: typeof c.rating === "number" ? c.rating : 0,
            progress: typeof c.progress === "number" ? c.progress : 0,
            category: c.category ?? "",
            instructor: c.instructor ?? "",
            price: c.price ?? (c.is_premium ? "Paid" : "Free"),
            trending: !!c.trending,
            completionRate: typeof c.completionRate === "number" ? c.completionRate : 0,
            is_premium: !!c.is_premium,
          }));
          setCourses(normalized);
        } else {
          // fallback to demo courses if backend returns empty results
          setCourses(DEMO_COURSES);
          if (mounted) setError("Backend returned no courses; using demo courses.");
        }
      } catch (err) {
        console.warn("Fetch courses failed:", err?.message || err);
        if (mounted) {
          setError("Using demo courses (backend unreachable).");
          setCourses(DEMO_COURSES);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, []);

  // Open course: if premium -> go to subscribe, else route to course detail
  function openCourse(course) {
    console.log("Open clicked for course", course?.id);
    if (!course) return;
    if (course.is_premium) {
      navigate(`/subscribe?course=${course.id}`);
      return;
    }
    navigate(`/course/${course.id}`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-500/15 to-pink-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-emerald-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10">
        {/* Hero */}
        <section className="text-center mb-20 space-y-8">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-full border border-emerald-500/20 backdrop-blur-sm">
            <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-sm font-semibold tracking-wide">Transform Your Financial Future</span>
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>

          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight text-white">
              Grow with <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">MLS</span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed">
              Master investing through <span className="font-semibold text-emerald-400 underline decoration-emerald-400/30">interactive lessons</span>,{" "}
              <span className="font-semibold text-blue-400 underline decoration-blue-400/30">real-time simulations</span>, and{" "}
              <span className="font-semibold text-purple-400 underline decoration-purple-400/30">expert mentorship</span>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-4">
            <button
              onClick={() => navigate("/course")}
              className="group px-8 py-4 bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 rounded-2xl text-white font-bold inline-flex items-center gap-3 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/25"
            >
              <Play className="w-5 h-5 transition-transform group-hover:scale-110" />
              Start Learning Now
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
            <Link
              to="/subscribe"
              className="group px-8 py-4 rounded-2xl text-slate-300 border border-slate-600 hover:border-slate-500 hover:bg-slate-800/50 transition-all duration-300 inline-flex items-center gap-2"
            >
              <Crown className="w-5 h-5 text-amber-400" />
              View Plans
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((s, i) => (
            <div key={i} className="group relative p-8 rounded-2xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-sm text-center hover:bg-slate-800/60 transition-all duration-300 hover:scale-105">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br ${s.color} bg-opacity-20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <s.icon className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-black text-white mb-1">{s.value}</div>
              <div className="text-sm text-slate-400 font-medium">{s.label}</div>
            </div>
          ))}
        </section>

        {/* Search / Filter */}
        <section className="mb-12 space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
              />
            </div>

            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Courses */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-2">Available Courses</h2>
              <p className="text-slate-400">Discover expert-crafted learning paths</p>
            </div>
            <div className="text-slate-300 bg-slate-800/30 px-4 py-2 rounded-xl border border-slate-700">
              {isLoading ? "Loading..." : `${filteredCourses.length} courses`}
            </div>
          </div>

          {error && (
            <div className="text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center">
              <span className="font-medium">⚠️ {error}</span>
            </div>
          )}

          {isLoading ? (
            <div className="grid md:grid-cols-2 gap-8">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-64 rounded-2xl bg-slate-800/40 mb-4"></div>
                  <div className="h-4 bg-slate-800/40 rounded mb-2"></div>
                  <div className="h-3 bg-slate-800/40 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2">
              {filteredCourses.map((course) => {
                const students = safeLocale(course.students);
                const completion = safeNumber(course.completionRate, 0);
                const difficultyStyle = difficultyColors[course.difficulty] || difficultyColors.Beginner;

                return (
                  <div
                    key={course.id}
                    className="group bg-slate-900/70 backdrop-blur-md rounded-2xl shadow-xl border border-slate-700/50 p-8 hover:shadow-emerald-500/20 hover:border-emerald-500/30 transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden"
                  >
                    {course.trending && (
                      <div className="absolute top-4 right-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        Trending
                      </div>
                    )}

                    <div className="mb-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-2xl font-bold text-emerald-300 group-hover:text-emerald-200 transition-colors">
                          {course.title}
                        </h3>
                        {course.is_premium ? (
                          <div className="flex items-center gap-1 bg-amber-400/20 text-amber-300 px-3 py-1 rounded-lg text-sm font-semibold">
                            <Crown className="w-4 h-4" />
                            Premium
                          </div>
                        ) : (
                          <div className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-lg text-sm font-semibold">
                            Free
                          </div>
                        )}
                      </div>

                      <p className="text-slate-300 text-base leading-relaxed line-clamp-3 mb-4">
                        {course.description}
                      </p>

                      <div className="flex flex-wrap gap-3 mb-4">
                        <div className={`px-3 py-1 rounded-lg text-sm font-medium border ${difficultyStyle}`}>
                          {course.difficulty}
                        </div>
                        <div className="flex items-center gap-1 text-slate-400 text-sm">
                          <BookOpen className="w-4 h-4" />
                          {course.lessons} lessons
                        </div>
                        <div className="flex items-center gap-1 text-slate-400 text-sm">
                          <Clock className="w-4 h-4" />
                          {course.duration}
                        </div>
                        <div className="flex items-center gap-1 text-slate-400 text-sm">
                          <Star className="w-4 h-4 text-amber-400" />
                          {course.rating}
                        </div>
                      </div>

                      {course.progress > 0 && (
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-400">Progress</span>
                            <span className="text-emerald-400 font-medium">{course.progress}%</span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-emerald-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${course.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm text-slate-400 mb-6">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>{course.instructor}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {students}
                          </div>
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                            {completion}%
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => openCourse(course)}
                        className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 ${
                          course.is_premium
                            ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black"
                            : "bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white"
                        }`}
                      >
                        {course.is_premium ? (
                          <>
                            <Crown className="w-4 h-4" />
                            Subscribe
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4" />
                            Start Course
                          </>
                        )}
                      </button>

                      <Link
                        to={`/course/${course.id}`}
                        className="px-4 py-3 text-slate-300 hover:text-white border border-slate-600 hover:border-slate-500 rounded-xl transition-all duration-300 flex items-center gap-2 group"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Details
                        <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!isLoading && filteredCourses.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-slate-800/50 rounded-full flex items-center justify-center">
                <Search className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No courses found</h3>
              <p className="text-slate-400 mb-6">Try adjusting your search criteria or browse all courses</p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All");
                }}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </section>

        {/* Team */}
        <section className="mt-20 py-16 border-t border-slate-700/50">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Meet Our Team</h2>
            <p className="text-slate-400">Passionate experts dedicated to your financial growth</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 text-center hover:border-emerald-500/30 transition-all duration-300">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Santhosh Cheemala</h3>
              <p className="text-emerald-400 font-medium mb-2">Founder & Developer</p>
              <p className="text-slate-400 text-sm mb-4">Leading the vision and technical development</p>
              <div className="flex items-center justify-center gap-4 text-sm text-slate-400">
                <a href="tel:7675887565" className="hover:text-emerald-400 transition-colors">
                  <Phone className="w-4 h-4" />
                </a>
                <a href="mailto:santhoshcheemala25@gmail.com" className="hover:text-emerald-400 transition-colors">
                  <Mail className="w-4 h-4" />
                </a>
                <a href="https://github.com/sunny9087" className="hover:text-emerald-400 transition-colors">
                  <Github className="w-4 h-4" />
                </a>
                <a href="https://www.linkedin.com/in/santhosh-c-a3005b351" className="hover:text-emerald-400 transition-colors">
                  <Linkedin className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 text-center hover:border-blue-500/30 transition-all duration-300">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <BarChart3 className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Mahesh Babu</h3>
              <p className="text-blue-400 font-medium mb-2">Co-Founder & Market Researcher</p>
              <p className="text-slate-400 text-sm mb-4">Analyzing market trends and opportunities</p>
              <div className="flex items-center justify-center gap-4 text-sm text-slate-400">
                <a href="tel:9010090192" className="hover:text-blue-400 transition-colors">
                  <Phone className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 text-center hover:border-purple-500/30 transition-all duration-300">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Lohith</h3>
              <p className="text-purple-400 font-medium mb-2">Tester & Sales</p>
              <p className="text-slate-400 text-sm mb-4">Ensuring quality and driving growth</p>
              <div className="flex items-center justify-center gap-4 text-sm text-slate-400">
                <a href="tel:9866748940" className="hover:text-purple-400 transition-colors">
                  <Phone className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
