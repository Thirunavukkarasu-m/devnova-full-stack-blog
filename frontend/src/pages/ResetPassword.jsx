import React, { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { authApi } from "../services/authApi";
import { getErrorMessage } from "../services/api";

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Reset token missing or invalid. Please request a new link.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 3000);
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
          <div
            className="d-inline-flex align-items-center justify-content-center text-white fw-bold shadow-sm mb-3"
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)",
            }}
          >
            <i className="bi bi-shield-check fs-4"></i>
          </div>
          <h3 className="fw-bold mb-1">Set New Password</h3>
          <p className="text-muted small">Choose a strong, unique password for your account</p>
        </div>

        {error && (
          <div className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-4">
            <i className="bi bi-exclamation-triangle-fill flex-shrink-0"></i>
            <div>{error}</div>
          </div>
        )}

        {success ? (
          <div className="text-center py-4">
            <div className="alert alert-success py-3 px-3 small mb-4">
              <i className="bi bi-check-circle-fill d-block fs-3 mb-2 text-success"></i>
              Your password has been successfully updated! Redirecting to login in 3 seconds...
            </div>
            <Link to="/login" className="btn btn-primary-gradient w-100">
              Go to Login Now
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold">New Password</label>
              <input
                type="password"
                required
                className="form-control bg-transparent"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ borderColor: "var(--dn-border)" }}
              />
            </div>

            <div className="mb-4">
              <label className="form-label small fw-semibold">Confirm New Password</label>
              <input
                type="password"
                required
                className="form-control bg-transparent"
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ borderColor: "var(--dn-border)" }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary-gradient w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status"></span>
                  <span>Updating Password...</span>
                </>
              ) : (
                <span>Update Password</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
