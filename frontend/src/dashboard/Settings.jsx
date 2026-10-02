import React from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { formatDate } from "../utils/helpers";

export const Settings = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div style={{ maxWidth: "760px" }}>
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Account & Preferences</h2>
        <span className="text-muted small">Manage application themes, security credentials, and preferences</span>
      </div>

      {/* Theme Settings */}
      <div className="dev-card p-4 mb-4">
        <h5 className="fw-bold mb-2">Appearance & Theme</h5>
        <p className="text-muted small mb-3">Choose how DevNova looks on your device.</p>

        <div className="d-flex align-items-center justify-content-between p-3 rounded-3 border" style={{ borderColor: "var(--dn-border)" }}>
          <div className="d-flex align-items-center gap-3">
            <i className={`bi ${theme === "dark" ? "bi-moon-stars-fill text-primary" : "bi-sun-fill text-warning"} fs-4`}></i>
            <div>
              <div className="fw-semibold">Current Mode: <span className="text-capitalize">{theme}</span></div>
              <span className="text-muted small">Switch between light and dark developer styles</span>
            </div>
          </div>

          <button onClick={toggleTheme} className="btn btn-outline-dev btn-sm">
            Toggle to {theme === "dark" ? "Light" : "Dark"}
          </button>
        </div>
      </div>

      {/* Account Info */}
      <div className="dev-card p-4 mb-4">
        <h5 className="fw-bold mb-3">Account Information</h5>
        <div className="d-flex flex-column gap-3">
          <div className="d-flex justify-content-between py-2 border-bottom" style={{ borderColor: "var(--dn-border)" }}>
            <span className="text-muted small">Email Address</span>
            <span className="fw-medium text-body">{user?.email}</span>
          </div>
          <div className="d-flex justify-content-between py-2 border-bottom" style={{ borderColor: "var(--dn-border)" }}>
            <span className="text-muted small">Username</span>
            <span className="fw-medium text-body">@{user?.username}</span>
          </div>
          <div className="d-flex justify-content-between py-2 border-bottom" style={{ borderColor: "var(--dn-border)" }}>
            <span className="text-muted small">Role</span>
            <span className="badge badge-tech">{user?.role}</span>
          </div>
          <div className="d-flex justify-content-between py-2" style={{ borderColor: "var(--dn-border)" }}>
            <span className="text-muted small">Member Since</span>
            <span className="text-muted small">{formatDate(user?.created_at)}</span>
          </div>
        </div>
      </div>

      {/* Security & Session */}
      <div className="dev-card p-4 border-danger-subtle">
        <h5 className="fw-bold text-danger mb-2">Session Control</h5>
        <p className="text-muted small mb-3">Log out of your active browser session on this device.</p>
        <button onClick={logout} className="btn btn-outline-danger btn-sm">
          <i className="bi bi-box-arrow-right me-1"></i> Log Out
        </button>
      </div>
    </div>
  );
};
