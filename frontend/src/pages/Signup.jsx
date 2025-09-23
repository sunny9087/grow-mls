// src/pages/Signup.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await axios.post("http://127.0.0.1:8000/auth/signup", {
        name,
        email,
        password,
      });

      const token = res.data.access_token;
      if (token) {
        localStorage.setItem("token", token);
        navigate("/course");
      } else {
        setError("Signup succeeded but no token returned.");
      }
    } catch (err) {
      console.error("Signup failed:", err);
      const detail = err?.response?.data?.detail || err?.response?.data || err.message;
      setError(detail || "Could not sign up. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Sign Up</h1>

      {error && <div className="mb-3 text-red-400">{String(error)}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 rounded bg-slate-800 text-white"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 rounded bg-slate-800 text-white"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-3 py-2 rounded bg-slate-800 text-white"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full px-3 py-2 rounded bg-indigo-600 text-white"
        >
          {loading ? "Signing up…" : "Sign Up"}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-400">
        Already have an account? <Link to="/login" className="text-indigo-400">Login</Link>
      </p>
    </div>
  );
}
