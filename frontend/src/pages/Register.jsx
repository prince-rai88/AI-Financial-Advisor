import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { authApi } from "../api";
import { notify } from "../utils/toast";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      await authApi.register({
        username: form.username.trim(),
        email: form.email.trim(),
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        password: form.password,
      });
      notify("Registration successful. Please sign in.", "success");
      navigate("/login", { replace: true });
    } catch (requestError) {
      const message =
        requestError?.response?.data?.username?.[0] ||
        requestError?.response?.data?.email?.[0] ||
        "Registration failed. Please review your details.";
      setError(message);
      notify(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-[#f8fafc] flex flex-col justify-center items-center p-6 relative overflow-hidden selection:bg-[#00e599]/30 selection:text-white">
      {/* Background ambient light fields */}
      <div className="ambient-light-field">
        <div className="ambient-light-orb-1" />
        <div className="ambient-light-orb-2" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[440px] relative z-10"
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-white/15 to-white/5 border border-white/20 shadow-xl flex items-center justify-center mb-3">
            <span className="text-lg font-semibold tracking-wider text-white">F</span>
          </div>
          <h1 className="text-2xl font-light tracking-tight text-white flex items-center gap-1.5">
            FinAI <span className="text-[#00e599] font-normal text-xs px-2 py-0.5 rounded-full bg-[#00e599]/10 border border-[#00e599]/20">OS</span>
          </h1>
          <p className="text-xs text-white/50 font-light mt-1">
            Create your permanent encrypted financial workspace
          </p>
        </div>

        {/* Apple-style Frosted Glass Card */}
        <div className="apple-card p-7 sm:p-8 backdrop-blur-3xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#00e599]/40 to-transparent" />

          <div className="mb-6">
            <h2 className="text-base font-medium text-white tracking-tight">Create Account</h2>
            <p className="text-xs text-white/50 mt-0.5">
              Enter your details to register a personal ledger
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-mono uppercase tracking-wider text-white/50 block mb-1.5">
                  First Name
                </label>
                <input
                  name="first_name"
                  type="text"
                  value={form.first_name}
                  onChange={handleChange}
                  placeholder="First name"
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono uppercase tracking-wider text-white/50 block mb-1.5">
                  Last Name
                </label>
                <input
                  name="last_name"
                  type="text"
                  value={form.last_name}
                  onChange={handleChange}
                  placeholder="Last name"
                  className="w-full"
                />
              </div>
            </div>

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
                placeholder="Choose username"
                className="w-full"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-white/50 block mb-1.5">
                Email Address
              </label>
              <input
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
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
                autoComplete="new-password"
                value={form.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                minLength={6}
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
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>
        </div>

        {/* Footer Navigation */}
        <p className="text-center text-xs text-white/50 mt-6 font-light">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-[#00e599] hover:underline font-medium transition-colors"
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
