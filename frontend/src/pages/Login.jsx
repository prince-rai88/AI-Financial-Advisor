import { lazy, Suspense, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { authApi } from "../api";
import { notify } from "../utils/toast";

const FinAiCore3D = lazy(() => import("../components/3d/FinAiCore3D"));

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
    <div className="min-h-screen bg-[#07090e] text-[#f8fafc] flex items-center justify-center p-6 relative overflow-hidden selection:bg-[#00e599]/30 selection:text-white">
      {/* Background ambient light fields shining through glass */}
      <div className="ambient-light-field">
        <div className="ambient-light-orb-1" />
        <div className="ambient-light-orb-2" />
      </div>

      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10 py-8">
        {/* ───────────────────────────────────────────────────────────── */}
        {/* LEFT COLUMN: REAL INTERACTIVE 3D FINAI CORE                   */}
        {/* ───────────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left"
        >
          {/* Brand Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-md mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#00e599] animate-pulse" />
            <span className="text-[11px] font-mono tracking-wider text-white/70 uppercase">
              Financial Intelligence v2.4
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-light tracking-tight text-white leading-[1.08] mb-4">
            Clarity in
            <br />
            <span className="font-normal text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-[#00e599]">
              Titanium & Quartz.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-white/50 font-light leading-relaxed max-w-lg mb-6">
            Autonomous ledger categorization, real-time ML anomaly detection, and
            predictive velocity forecasting—engineered with uncompromising aesthetic discipline.
          </p>

          {/* Interactive 3D WebGL Canvas */}
          <div className="w-full h-72 sm:h-80 relative rounded-3xl overflow-hidden apple-card-subtle p-2 mb-6 group cursor-grab active:cursor-grabbing">
            <Suspense
              fallback={
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-[#00e599] animate-spin" />
                </div>
              }
            >
              <FinAiCore3D variant="hero" interactive={true} />
            </Suspense>

            {/* Micro 3D Interaction Tip */}
            <div className="absolute bottom-3 inset-x-0 flex items-center justify-center pointer-events-none">
              <span className="text-[10px] font-mono tracking-widest uppercase px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/50">
                Move pointer to tilt 3D optical core
              </span>
            </div>
          </div>

          {/* Architecture Spec Badges */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs font-mono text-white/40">
            <div>
              <span className="block text-[9px] uppercase tracking-wider text-white/30">ML Model</span>
              <span className="text-white/80">IsolationForest</span>
            </div>
            <div>
              <span className="block text-[9px] uppercase tracking-wider text-white/30">API Latency</span>
              <span className="text-[#00e599]">~12ms DRF Core</span>
            </div>
            <div>
              <span className="block text-[9px] uppercase tracking-wider text-white/30">Sandbox</span>
              <span className="text-white/80">Deterministic Demo</span>
            </div>
          </div>
        </motion.div>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* RIGHT COLUMN: APPLE FROSTED GLASS SIGN-IN SHEET               */}
        {/* ───────────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-5 w-full max-w-[420px] mx-auto"
        >
          <div className="apple-card p-7 sm:p-8 backdrop-blur-3xl relative overflow-hidden">
            {/* Top ambient highlight line */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#00e599]/40 to-transparent" />

            <div className="mb-6">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-white/15 to-white/5 border border-white/20 shadow-md flex items-center justify-center text-white text-xs font-semibold">
                  F
                </div>
                <div>
                  <h2 className="text-base font-medium text-white tracking-tight">FinAI Workspace</h2>
                  <p className="text-[11px] text-white/40 font-light">Sign in to your account</p>
                </div>
              </div>
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
                <label className="text-[11px] font-mono uppercase tracking-wider text-white/50 block mb-1.5">
                  Password
                </label>
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
                or explore demo
              </span>
            </div>

            {/* Prominent Continue as Guest Demo Button */}
            <button
              type="button"
              onClick={handleContinueAsGuest}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00e599]/15 via-white/[0.05] to-[#00e599]/15 hover:from-[#00e599]/25 hover:to-[#00e599]/25 border border-[#00e599]/35 hover:border-[#00e599]/60 text-white text-xs font-semibold transition-all shadow-[0_0_20px_rgba(0,229,153,0.15)] hover:shadow-[0_0_25px_rgba(0,229,153,0.3)] flex items-center justify-center gap-2 cursor-pointer group"
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
              Deterministic sample sandbox · Zero signup required
            </p>
          </div>

          {/* Footer Navigation */}
          <p className="text-center text-xs text-white/50 mt-5 font-light">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-[#00e599] hover:underline font-medium transition-colors"
            >
              Create free account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
