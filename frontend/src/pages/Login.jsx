import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../services/authApi";
import { getErrorMessage } from "../services/api";

export const Login = () => {
  const { login, setAuthData, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState("");

  const searchParams = new URLSearchParams(location.search);
  const redirectPath = searchParams.get("redirect") || "/dashboard";
  const oauthCode = searchParams.get("code");
  const oauthProvider = searchParams.get("provider");

  // Handle OAuth callback if code is present in URL
  useEffect(() => {
    if (oauthCode) {
      handleOAuthCallback(oauthCode, oauthProvider || "google");
    }
  }, [oauthCode]);

  useEffect(() => {
    if (isAuthenticated && !oauthCode) {
      navigate(user?.role === "ADMIN" ? "/admin" : "/dashboard", { replace: true });
    }
  }, [isAuthenticated, user, navigate, oauthCode]);

  const handleOAuthCallback = async (code, provider) => {
    try {
      setOauthLoading(true);
      setError("");
      const currentUrl = window.location.origin + "/login";
      let data;
      if (provider === "github") {
        data = await authApi.githubCallback(code, currentUrl);
      } else {
        data = await authApi.googleCallback(code, currentUrl);
      }
      setAuthData(data);
      navigate(data.user.role === "ADMIN" ? "/admin" : "/dashboard", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setOauthLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const loggedUser = await login({
        username_or_email: identifier.trim(),
        password,
        remember_me: rememberMe,
      });
      navigate(loggedUser.role === "ADMIN" ? "/admin" : redirectPath, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setOauthLoading(true);
      setError("");
      const currentUrl = window.location.origin + "/login";
      const { url } = await authApi.getGoogleAuthUrl(currentUrl);
      // In development when credentials are xxxx, backend simulation handles direct code exchange
      window.location.href = url;
    } catch (err) {
      setError(getErrorMessage(err));
      setOauthLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    try {
      setOauthLoading(true);
      setError("");
      const currentUrl = window.location.origin + "/login";
      const { url } = await authApi.getGithubAuthUrl(currentUrl);
      window.location.href = url;
    } catch (err) {
      setError(getErrorMessage(err));
      setOauthLoading(false);
    }
  };

  return (
    <div className="container py-5 my-auto" style={{ maxWidth: "460px" }}>
      <div className="dev-card p-4 p-sm-5 shadow-lg">
        {/* Brand Header */}
        <div className="text-center mb-4">
          <Link to="/" className="d-inline-flex align-items-center gap-2 text-decoration-none mb-3">
            <div
              className="d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)",
              }}
            >
              <i className="bi bi-code-slash fs-4"></i>
            </div>
          </Link>
          <h3 className="fw-bold mb-1">Welcome back to DevNova</h3>
          <p className="text-muted small">Explore. Learn. Build.</p>
        </div>

        {error && (
          <div className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-4" role="alert">
            <i className="bi bi-exclamation-triangle-fill flex-shrink-0"></i>
            <div>{error}</div>
          </div>
        )}

        {/* OAuth Buttons */}
        <div className="d-flex flex-column gap-2 mb-4">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={oauthLoading || loading}
            className="btn btn-outline-dev py-2 d-flex align-items-center justify-content-center gap-2 w-100"
          >
            <i className="bi bi-google text-danger"></i>
            <span>Continue with Google</span>
          </button>

          <button
            type="button"
            onClick={handleGithubLogin}
            disabled={oauthLoading || loading}
            className="btn btn-outline-dev py-2 d-flex align-items-center justify-content-center gap-2 w-100"
          >
            <i className="bi bi-github"></i>
            <span>Continue with GitHub</span>
          </button>
        </div>

        <div className="position-relative text-center my-4">
          <hr style={{ borderColor: "var(--dn-border)" }} />
          <span
            className="position-absolute top-50 start-50 translate-middle px-3 small text-muted"
            style={{ backgroundColor: "var(--dn-surface-card)" }}
          >
            or continue with email
          </span>
        </div>

        {/* Traditional Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Email or Username</label>
            <div className="input-group">
              <span className="input-group-text bg-transparent" style={{ borderColor: "var(--dn-border)" }}>
                <i className="bi bi-person text-muted"></i>
              </span>
              <input
                type="text"
                required
                className="form-control bg-transparent"
                placeholder="developer@example.com or username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                style={{ borderColor: "var(--dn-border)" }}
              />
            </div>
          </div>

          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label className="form-label small fw-semibold mb-0">Password</label>
              <Link to="/forgot-password" style={{ fontSize: "0.75rem" }} className="text-decoration-none">
                Forgot password?
              </Link>
            </div>
            <div className="input-group">
              <span className="input-group-text bg-transparent" style={{ borderColor: "var(--dn-border)" }}>
                <i className="bi bi-lock text-muted"></i>
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                className="form-control bg-transparent"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ borderColor: "var(--dn-border)" }}
              />
              <button
                type="button"
                className="input-group-text bg-transparent text-muted border-start-0"
                onClick={() => setShowPassword(!showPassword)}
                style={{ borderColor: "var(--dn-border)" }}
              >
                <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
              </button>
            </div>
          </div>

          <div className="form-check mb-4">
            <input
              type="checkbox"
              className="form-check-input"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label className="form-check-label small text-muted" htmlFor="rememberMe">
              Remember me on this device
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || oauthLoading}
            className="btn btn-primary-gradient w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status"></span>
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <div className="text-center mt-4 text-muted small">
          Don't have an account?{" "}
          <Link to="/register" className="fw-semibold text-decoration-none text-primary">
            Sign up now
          </Link>
        </div>

        {/* Demo Credentials Helper Pill */}
        <div className="mt-4 p-3 rounded-3 dev-card border-dashed small text-muted" style={{ fontSize: "0.75rem" }}>
          <div className="fw-bold mb-1 text-body">Demo Accounts:</div>
          <div>Admin: <code>admin@devnova.io</code> / <code>Password@123</code></div>
          <div>Author: <code>alex.rivera@devnova.io</code> / <code>Password@123</code></div>
        </div>
      </div>
    </div>
  );
};
