import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";

function Login({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
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
      const response = await API.post("login/", {
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

      navigate("/dashboard", { replace: true });
    } catch {
      setError("Login failed. Check your username and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-shell">
      <div className="auth-card">
        <p className="mb-2 inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-teal-700">
          Welcome Back
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Sign in</h1>
        <p className="mt-2 muted-text">Access your financial dashboard and insights.</p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Username</span>
            <input
              className="form-input"
              name="username"
              type="text"
              autoComplete="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Enter username"
              required
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Password</span>
            <input
              className="form-input"
              name="password"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter password"
              required
            />
          </label>

          {error ? (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
          ) : null}

          <button className="btn-primary w-full" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-600">
          New here?{" "}
          <Link className="font-semibold text-teal-700 hover:text-teal-800" to="/register">
            Create an account
          </Link>
        </p>
      </div>
    </section>
  );
}

export default Login;
