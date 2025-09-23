// src/components/ErrorBoundary.jsx
import React from "react";
import { Link } from "react-router-dom";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    this.setState({ info });
    // optionally log to an external service
    // console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900 flex items-center justify-center p-6">
          <div className="max-w-2xl w-full bg-slate-800/90 rounded-xl p-8 border border-slate-700 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Something went wrong</h2>
            <p className="text-slate-300 mb-4">The app encountered an unexpected error. Try refreshing the page.</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                Reload
              </button>
              <Link to="/" className="px-4 py-2 rounded border border-slate-600 text-slate-200 hover:bg-slate-700">
                Go Home
              </Link>
            </div>
            <details className="text-left mt-4 text-xs text-slate-400">
              <summary className="cursor-pointer">Debug info</summary>
              <pre className="break-words mt-2">{String(this.state.error?.stack || this.state.error)}</pre>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
