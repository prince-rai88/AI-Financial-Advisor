import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../api";
import { notify } from "../utils/toast";

function Login({ onLoginSuccess, onGuestLogin }) {
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
    notify("Welcome to FinAI Demo Mode!", "info");
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
      });

      notify("Login successful", "success");
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
    <div className="min-h-screen bg-[#0d0f14] flex items-center justify-center p-4">
      <div className="w-full max-w-[380px]">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-xl bg-[#6c63ff] flex items-center justify-center text-white text-[13px] font-bold">
            F
          </div>
          <span className="text-[20px] font-bold text-[#f1f5f9]">
            Fin<span className="text-[#6c63ff]">AI</span>
          </span>
        </div>

        <div className="w-full max-w-[420px] px-4 rounded-2xl p-[1px] bg-[linear-gradient(to_right,#6c63ff,#10b981)]">
          <div className="bg-[#161b27] rounded-2xl p-8">
            <h2 className="text-[18px] font-semibold text-[#f1f5f9] mb-1">Welcome back</h2>
            <p className="text-[13px] text-[#64748b] mb-6">Sign in to your account</p>

            <form onSubmit={handleSubmit}>
            <label className="text-[12px] text-[#64748b] font-medium mb-1.5 block">Username</label>
            <input
              name="username"
              type="text"
              autoComplete="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Enter your username"
              className="mb-4 text-[14px]"
              required
            />

            <label className="text-[12px] text-[#64748b] font-medium mb-1.5 block">Password</label>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="mb-6 text-[14px]"
              required
            />

            {error ? (
              <p className="mb-4 text-[12px] text-[#f43f5e]">{error}</p>
            ) : null}

            <button
              className="w-full bg-[#6c63ff] hover:bg-[#5a52e0] text-white font-semibold py-3 rounded-xl text-[14px] transition-colors"
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="relative my-5 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <span className="relative bg-[#161b27] px-3 text-[11px] uppercase tracking-wider text-[#64748b]">
              or explore demo
            </span>
          </div>

          <button
            type="button"
            onClick={handleContinueAsGuest}
            className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-[#f1f5f9] border border-white/10 hover:border-[#6c63ff]/40 font-medium py-3 rounded-xl text-[13px] transition-all cursor-pointer"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6c63ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Continue as Guest
          </button>
          </div>
        </div>

        <p className="text-center text-[13px] text-[#64748b] mt-5">
          Don't have an account?
          <Link className="text-[#6c63ff] hover:underline ml-1" to="/register">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
