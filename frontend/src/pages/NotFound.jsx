import React from "react";
import { Link } from "react-router-dom";

export const NotFound = () => {
  return (
    <div className="container py-5 my-auto text-center" style={{ maxWidth: "600px" }}>
      <div className="dev-card p-5 shadow-lg">
        {/* Brand Icon */}
        <div
          className="d-inline-flex align-items-center justify-content-center text-white fw-bold shadow-sm mb-4"
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "14px",
            background: "linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)",
          }}
        >
          <i className="bi bi-code-slash fs-2"></i>
        </div>

        <h1 className="display-4 fw-extrabold text-gradient mb-2">404</h1>
        <h3 className="fw-bold mb-3">Page Not Found</h3>
        <p className="text-muted mb-4">
          The technical article, author, or endpoint you are looking for doesn't exist, was renamed, or has moved to a new route.
        </p>

        <div className="d-flex justify-content-center gap-3">
          <Link to="/" className="btn btn-primary-gradient px-4 py-2">
            <i className="bi bi-house-door-fill me-2"></i>
            Back to Home
          </Link>
          <Link to="/explore" className="btn btn-outline-dev px-4 py-2">
            Explore Articles
          </Link>
        </div>
      </div>
    </div>
  );
};
