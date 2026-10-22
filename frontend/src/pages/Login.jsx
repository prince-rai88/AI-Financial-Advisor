import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../api";
import { notify } from "../utils/toast";

export default function Login({ onLoginSuccess, onGuestLogin }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleContinueAsGuest = () => {
    if (onGuestLogin) {
      onGuestLogin();
    }
    notify("Entered FinAI Demo Mode", "info");
    navigate("/dashboard", { replace: true });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const response = await authApi.login({
        username: form.username.trim(),
        password: form.password,
      });

      const accessToken = response.data?.access;
      if (!accessToken) {
        throw new Error("Missing access token");
      }

      onLoginSuccess({
        access: accessToken,
        refresh: response.data?.refresh,
        username: form.username.trim(),
      });

      notify("Welcome back to FinAI", "success");
      navigate("/dashboard", { replace: true });
    } catch (requestError) {
      const message =
        requestError?.response?.data?.detail ||
        "Login failed. Check your username and password.";
      setError(message);
      notify(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-[#f8fafc] flex flex-col justify-center items-center p-6 relative overflow-hidden selection:bg-[#00e599]/30 selection:text-white">
      {/* Ambient background studio glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-[#00e599]/10 via-[#38bdf8]/5 to-transparent blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 inset-x-0 h-40 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

      <div className="w-full max-w-[400px] relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-white/15 to-white/5 border border-white/20 shadow-xl flex items-center justify-center mb-3">
            <span className="text-lg font-semibold tracking-wider text-white">F</span>
          </div>
          <h1 className="text-2xl font-light tracking-tight text-white flex items-center gap-1.5">
            FinAI <span className="text-[#00e599] font-normal text-xs px-2 py-0.5 rounded-full bg-[#00e599]/10 border border-[#00e599]/20">OS</span>
          </h1>
          <p className="text-xs text-white/50 font-light mt-1">
            Financial clarity, engineered to perfection.
          </p>
        </div>

        {/* Apple-style Frosted Glass Card */}
        <div className="apple-card p-7 sm:p-8 backdrop-blur-2xl">
          <div className="mb-6">
            <h2 className="text-base font-medium text-white tracking-tight">Sign In</h2>
            <p className="text-xs text-white/50 mt-0.5">
              Access your real-time ledger and AI analytics
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-white/50 block mb-1.5">
                Username
              </label>
              <input
                name="username"
                type="text"
                autoComplete="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Enter username"
                className="w-full"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-white/50 block">
                  Password
                </label>
              </div>
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full"
                required
              />
            </div>

            {error ? (
              <div className="p-3 rounded-xl bg-[#f43f5e]/10 border border-[#f43f5e]/25 text-xs text-[#f43f5e] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#f43f5e]" />
                <span>{error}</span>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-white hover:bg-white/95 text-black text-xs font-semibold tracking-wide transition-all shadow-[0_2px_15px_rgba(255,255,255,0.15)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Authenticating..." : "Sign In to Account"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.08]" />
            </div>
            <span className="relative bg-[#0b0e14] px-3 text-[10px] uppercase font-mono tracking-widest text-white/40">
              or explore instantly
            </span>
          </div>

          {/* Prominent Continue as Guest Demo Button */}
          <button
            type="button"
            onClick={handleContinueAsGuest}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00e599]/15 via-white/[0.05] to-[#00e599]/15 hover:from-[#00e599]/25 hover:to-[#00e599]/25 border border-[#00e599]/30 hover:border-[#00e599]/50 text-white text-xs font-semibold transition-all shadow-[0_0_20px_rgba(0,229,153,0.15)] hover:shadow-[0_0_25px_rgba(0,229,153,0.25)] flex items-center justify-center gap-2 cursor-pointer group"
          >
            <span className="w-2 h-2 rounded-full bg-[#00e599] animate-pulse" />
            <span>Continue as Guest Demo</span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="text-[#00e599] group-hover:translate-x-0.5 transition-transform"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
          <p className="text-[10px] text-center text-white/40 mt-2 font-light">
            No signup required · Deterministic sample dataset
          </p>
        </div>

        {/* Footer Navigation */}
        <p className="text-center text-xs text-white/50 mt-6 font-light">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-[#00e599] hover:underline font-medium transition-colors"
          >
            Create free account
          </Link>
        </p>
      </div>
    </div>
  );
}
