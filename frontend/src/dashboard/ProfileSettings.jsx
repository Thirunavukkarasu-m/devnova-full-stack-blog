import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { userApi } from "../services/userApi";
import { blogApi } from "../services/blogApi";
import { getErrorMessage } from "../services/api";

export const ProfileSettings = () => {
  const { user, updateUser } = useAuth();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    bio: "",
    website: "",
    github_profile: "",
    linkedin_profile: "",
    location: "",
    profile_image: "",
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        bio: user.profile?.bio || "",
        website: user.profile?.website || "",
        github_profile: user.profile?.github_profile || "",
        linkedin_profile: user.profile?.linkedin_profile || "",
        location: user.profile?.location || "",
        profile_image: user.profile_image || "",
      });
      document.title = "Profile Settings — DevNova";
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

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
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const updated = await userApi.updateProfile(formData);
      updateUser(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: "760px" }}>
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Profile Information</h2>
        <span className="text-muted small">Update your public identity, developer bio, and links</span>
      </div>

      {success && (
        <div className="alert alert-success py-2 px-3 small d-flex align-items-center gap-2 mb-4">
          <i className="bi bi-check-circle-fill"></i>
          <div>Profile updated successfully!</div>
        </div>
      )}

      {error && (
        <div className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-4">
          <i className="bi bi-exclamation-triangle-fill"></i>
          <div>{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="dev-card p-4 p-md-5">
        {/* Avatar Upload */}
        <div className="d-flex align-items-center gap-4 mb-4 pb-4 border-bottom" style={{ borderColor: "var(--dn-border)" }}>
          <img
            src={formData.profile_image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"}
            alt="Profile Preview"
            className="rounded-circle border"
            style={{ width: "80px", height: "80px", objectFit: "cover", borderColor: "var(--dn-border)" }}
          />
          <div>
            <label className="form-label small fw-semibold mb-1">Avatar Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageFileChange}
              className="form-control form-control-sm bg-transparent mb-1"
              style={{ borderColor: "var(--dn-border)" }}
            />
            {uploadingImage && <span className="small text-muted d-block">Uploading image...</span>}
            <span className="text-muted" style={{ fontSize: "0.75rem" }}>
              Recommended: 400x400 JPG, PNG or WEBP
            </span>
          </div>
        </div>

        {/* Names */}
        <div className="row g-3 mb-3">
          <div className="col-12 col-sm-6">
            <label className="form-label small fw-semibold">First Name *</label>
            <input
              type="text"
              name="first_name"
              required
              className="form-control bg-transparent"
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
              value={formData.last_name}
              onChange={handleChange}
              style={{ borderColor: "var(--dn-border)" }}
            />
          </div>
        </div>

        {/* Bio */}
        <div className="mb-3">
          <label className="form-label small fw-semibold">Biography</label>
          <textarea
            name="bio"
            rows="3"
            className="form-control bg-transparent"
            placeholder="Introduce your background, languages you use, and areas of interest..."
            value={formData.bio}
            onChange={handleChange}
            style={{ borderColor: "var(--dn-border)" }}
          />
        </div>

        {/* Location */}
        <div className="mb-3">
          <label className="form-label small fw-semibold">Location</label>
          <input
            type="text"
            name="location"
            className="form-control bg-transparent"
            placeholder="e.g., Seattle, WA or Remote"
            value={formData.location}
            onChange={handleChange}
            style={{ borderColor: "var(--dn-border)" }}
          />
        </div>

        {/* Links */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-md-4">
            <label className="form-label small fw-semibold">Personal Website</label>
            <input
              type="url"
              name="website"
              className="form-control bg-transparent"
              placeholder="https://mysite.dev"
              value={formData.website}
              onChange={handleChange}
              style={{ borderColor: "var(--dn-border)" }}
            />
          </div>
          <div className="col-12 col-md-4">
            <label className="form-label small fw-semibold">GitHub Profile</label>
            <input
              type="url"
              name="github_profile"
              className="form-control bg-transparent"
              placeholder="https://github.com/..."
              value={formData.github_profile}
              onChange={handleChange}
              style={{ borderColor: "var(--dn-border)" }}
            />
          </div>
          <div className="col-12 col-md-4">
            <label className="form-label small fw-semibold">LinkedIn Profile</label>
            <input
              type="url"
              name="linkedin_profile"
              className="form-control bg-transparent"
              placeholder="https://linkedin.com/in/..."
              value={formData.linkedin_profile}
              onChange={handleChange}
              style={{ borderColor: "var(--dn-border)" }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving || uploadingImage}
          className="btn btn-primary-gradient px-4 py-2"
        >
          {saving ? "Saving Changes..." : "Save Profile"}
        </button>
      </form>
    </div>
  );
};
