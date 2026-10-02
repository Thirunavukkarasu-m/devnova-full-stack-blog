import React, { useState } from "react";
import { Link } from "react-router-dom";
import { authApi } from "../services/authApi";
import { getErrorMessage } from "../services/api";

export const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);
    try {
      const res = await authApi.forgotPassword(email.trim());
      setSuccessMessage(res.message || "If that email exists in our records, a password reset link has been dispatched.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 my-auto" style={{ maxWidth: "460px" }}>
      <div className="dev-card p-4 p-sm-5 shadow-lg">
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
              <i className="bi bi-key-fill fs-4"></i>
            </div>
          </Link>
          <h3 className="fw-bold mb-1">Reset Password</h3>
          <p className="text-muted small">Enter your email and we'll send you recovery instructions</p>
        </div>

        {error && (
          <div className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-4">
            <i className="bi bi-exclamation-triangle-fill flex-shrink-0"></i>
            <div>{error}</div>
          </div>
        )}

        {successMessage ? (
          <div className="text-center py-3">
            <div className="alert alert-success py-3 px-3 small mb-4">
              <i className="bi bi-check-circle-fill d-block fs-3 mb-2 text-success"></i>
              {successMessage}
            </div>
            <Link to="/login" className="btn btn-outline-dev w-100">
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="form-label small fw-semibold">Account Email</label>
              <div className="input-group">
                <span className="input-group-text bg-transparent" style={{ borderColor: "var(--dn-border)" }}>
                  <i className="bi bi-envelope text-muted"></i>
                </span>
                <input
                  type="email"
                  required
                  className="form-control bg-transparent"
                  placeholder="developer@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ borderColor: "var(--dn-border)" }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary-gradient w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status"></span>
                  <span>Sending Link...</span>
                </>
              ) : (
                <span>Send Reset Link</span>
              )}
            </button>
          </form>
        )}

        <div className="text-center mt-4 text-muted small">
          Remembered your password?{" "}
          <Link to="/login" className="fw-semibold text-decoration-none text-primary">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};
