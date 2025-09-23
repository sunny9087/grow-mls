// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

export default function Login() {
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
      // send JSON matching backend LoginIn { username, password }
      const res = await axios.post("http://127.0.0.1:8000/auth/login", {
        username: email,
        password: password,
      });

      const token = res.data.access_token;
      if (token) {
        localStorage.setItem("token", token);
        navigate("/course");
      } else {
        setError("Login succeeded but no token returned.");
      }
    } catch (err) {
      console.error("Login failed:", err);
      // show backend-provided detail if available
      const detail = err?.response?.data?.detail || err?.response?.data || err.message;
      setError(detail || "Invalid credentials or server error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Login</h1>

      {error && <div className="mb-3 text-red-400">{String(error)}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
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
          {loading ? "Logging in…" : "Login"}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-400">
        Don’t have an account?{" "}
        <Link to="/signup" className="text-indigo-400">Sign up</Link>
      </p>
    </div>
  );
}
