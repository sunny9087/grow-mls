// src/App.jsx
import React, { Suspense } from "react";
import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Course from "./pages/Course";
import Lesson from "./pages/Lesson";
import Quiz from "./pages/Quiz";
import Progress from "./pages/Progress";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Subscribe from "./pages/Subscribe"; // ✅ Correct component name

function PageWrapper({ children }) {
  return <div className="max-w-3xl mx-auto p-6">{children}</div>;
}

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-black text-slate-100">
      {/* Header */}
      <header className="w-full py-6 px-6 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            to="/"
            className="text-2xl font-bold text-emerald-300 hover:text-emerald-400 transition-colors"
          >
            Grow with MLS
          </Link>

          <nav className="space-x-4">
            <Link
              to="/progress"
              className="text-sm text-emerald-300 hover:text-emerald-400 transition-colors"
            >
              Progress
            </Link>
            <Link
              to="/login"
              className="text-sm text-emerald-300 hover:text-emerald-400 transition-colors"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="text-sm text-emerald-300 hover:text-emerald-400 transition-colors"
            >
              Signup
            </Link>
          </nav>
        </div>
      </header>

      {/* Routes */}
      <main className="min-h-[calc(100vh-88px)]">
        {/* Suspense is safe to keep in case you convert pages to lazy imports later */}
        <Suspense
          fallback={
            <div className="min-h-[calc(100vh-88px)] flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-300 mx-auto mb-3" />
                <p className="text-slate-300">Loading...</p>
              </div>
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/course" element={<PageWrapper><Course /></PageWrapper>} />
            <Route path="/course/:id" element={<PageWrapper><Course /></PageWrapper>} />
            <Route path="/lesson/:id" element={<PageWrapper><Lesson /></PageWrapper>} />
            <Route path="/quiz/:id" element={<PageWrapper><Quiz /></PageWrapper>} />
            <Route path="/progress" element={<PageWrapper><Progress /></PageWrapper>} />
            <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
            <Route path="/signup" element={<PageWrapper><Signup /></PageWrapper>} />
            <Route path="/subscribe" element={<PageWrapper><Subscribe /></PageWrapper>} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}
