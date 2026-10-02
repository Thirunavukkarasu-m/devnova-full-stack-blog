import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { blogApi } from "../services/blogApi";
import { getErrorMessage } from "../services/api";

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    confirm_password: "",
    bio: "",
    profile_image: "",
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (JPEG, PNG, WEBP).");
      return;
    }

    try {
      setUploadingImage(true);
      setError("");
      const res = await blogApi.uploadImage(file);
      setFormData((prev) => ({ ...prev, profile_image: res.url }));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      await register(formData);
      navigate("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 my-auto" style={{ maxWidth: "560px" }}>
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
              <i className="bi bi-code-slash fs-4"></i>
            </div>
          </Link>
          <h3 className="fw-bold mb-1">Create your DevNova Account</h3>
          <p className="text-muted small">Join thousands of software engineers sharing modern engineering knowledge</p>
        </div>

        {error && (
          <div className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-4" role="alert">
            <i className="bi bi-exclamation-triangle-fill flex-shrink-0"></i>
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="row g-3 mb-3">
            <div className="col-12 col-sm-6">
              <label className="form-label small fw-semibold">First Name *</label>
              <input
                type="text"
                name="first_name"
                required
                className="form-control bg-transparent"
                placeholder="Ada"
                value={formData.first_name}
                onChange={handleChange}
                style={{ borderColor: "var(--dn-border)" }}
              />
            </div>
            <div className="col-12 col-sm-6">
              <label className="form-label small fw-semibold">Last Name *</label>
              <input
                type="text"
                name="last_name"
                required
                className="form-control bg-transparent"
                placeholder="Lovelace"
                value={formData.last_name}
                onChange={handleChange}
                style={{ borderColor: "var(--dn-border)" }}
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold">Username *</label>
            <div className="input-group">
              <span className="input-group-text bg-transparent text-muted" style={{ borderColor: "var(--dn-border)" }}>@</span>
              <input
                type="text"
                name="username"
                required
                className="form-control bg-transparent"
                placeholder="adalovelace"
                value={formData.username}
                onChange={handleChange}
                style={{ borderColor: "var(--dn-border)" }}
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold">Email Address *</label>
            <input
              type="email"
              name="email"
              required
              className="form-control bg-transparent"
              placeholder="ada@example.com"
              value={formData.email}
              onChange={handleChange}
              style={{ borderColor: "var(--dn-border)" }}
            />
          </div>

          <div className="row g-3 mb-3">
            <div className="col-12 col-sm-6">
              <label className="form-label small fw-semibold">Password *</label>
              <input
                type="password"
                name="password"
                required
                className="form-control bg-transparent"
                placeholder="Min 6 characters"
                value={formData.password}
                onChange={handleChange}
                style={{ borderColor: "var(--dn-border)" }}
              />
            </div>
            <div className="col-12 col-sm-6">
              <label className="form-label small fw-semibold">Confirm Password *</label>
              <input
                type="password"
                name="confirm_password"
                required
                className="form-control bg-transparent"
                placeholder="Repeat password"
                value={formData.confirm_password}
                onChange={handleChange}
                style={{ borderColor: "var(--dn-border)" }}
              />
            </div>
          </div>

          {/* Profile Photo Upload */}
          <div className="mb-3">
            <label className="form-label small fw-semibold">Profile Photo (Optional)</label>
            <div className="d-flex align-items-center gap-3">
              {formData.profile_image ? (
                <img
                  src={formData.profile_image}
                  alt="Avatar preview"
                  className="rounded-circle border"
                  style={{ width: "48px", height: "48px", objectFit: "cover", borderColor: "var(--dn-border)" }}
                />
              ) : (
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center text-muted border"
                  style={{ width: "48px", height: "48px", backgroundColor: "var(--dn-surface)", borderColor: "var(--dn-border)" }}
                >
                  <i className="bi bi-person fs-4"></i>
                </div>
              )}
              <div className="flex-grow-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="form-control form-control-sm bg-transparent"
                  style={{ borderColor: "var(--dn-border)" }}
                />
                {uploadingImage && <span className="small text-muted mt-1 d-block">Uploading image...</span>}
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label small fw-semibold">Short Bio (Optional)</label>
            <textarea
              name="bio"
              rows="2"
              className="form-control bg-transparent"
              placeholder="Backend engineer exploring cloud native architectures and Python..."
              value={formData.bio}
              onChange={handleChange}
              style={{ borderColor: "var(--dn-border)" }}
            />
          </div>

          <button
            type="submit"
            disabled={loading || uploadingImage}
            className="btn btn-primary-gradient w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status"></span>
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        <div className="text-center mt-4 text-muted small">
          Already have an account?{" "}
          <Link to="/login" className="fw-semibold text-decoration-none text-primary">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
