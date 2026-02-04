import "../styles.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { login as loginRequest } from "../api";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginRequest(email.trim(), password);

      // More flexible token extraction (keep this version)
      const accessToken =
        data?.accessToken ||
        data?.token ||
        data?.access ||
        data?.tokens?.accessToken;

      const refreshToken =
        data?.refreshToken || data?.refresh || data?.tokens?.refreshToken;

      if (!accessToken || !refreshToken) {
        throw new Error(
          "Login succeeded but tokens were not found in the response."
        );
      }

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      if (data?.user) localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/home", { replace: true });
    } catch (err) {
      setError(err?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Log In</h1>
        <p className="auth-subtitle">Welcome back.</p>

        {error ? <div className="auth-error">{error}</div> : null}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-label">
            Email
            <input
              className="auth-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email here"
              autoComplete="email"
              required
            />
          </label>

          <label className="auth-label">
            Password
            <input
              className="auth-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password here"
              autoComplete="current-password"
              required
            />
          </label>

          <button
            className="btn auth-primary login"
            type="submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p className="auth-footer">
          Don’t have an account?{" "}
          <Link className="auth-link" to="/signup">
            Sign up
          </Link>
        </p>

        <Link className="auth-back" to="/">
          ← Back
        </Link>
      </div>
    </div>
  );
}
