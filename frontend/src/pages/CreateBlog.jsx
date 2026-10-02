import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { blogApi } from "../services/blogApi";
import { getErrorMessage } from "../services/api";

export const CreateBlog = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState("write"); // 'write' or 'preview'
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const cats = await blogApi.getCategories();
      setCategories(cats || []);
      if (cats.length > 0) {
        setCategoryId(cats[0].id.toString());
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Auto-generate slug on title change if not customized manually
  const handleTitleChange = (e) => {
    const val = e.target.value;
    setTitle(val);
    const generated = val
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[-\s]+/g, "-")
      .trim();
    setSlug(generated);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      setError("");
      const res = await blogApi.uploadImage(file);
      setCoverImage(res.url);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUploadingImage(false);
    }
  };

  // Metrics calculation
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const estimatedReadingTime = Math.max(1, Math.ceil(wordCount / 200));

  const handleSave = async (statusToSet) => {
    if (!title.trim()) {
      setError("Article title is required.");
      return;
    }
    if (!content.trim()) {
      setError("Article content cannot be empty.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const tagsArray = tagsInput
        .split(",")
        .map((t) => t.trim().replace(/^#/, ""))
        .filter(Boolean);

      const payload = {
        title: title.trim(),
        slug: slug.trim() || undefined,
        excerpt: excerpt.trim() || undefined,
        content: content.trim(),
        cover_image: coverImage || undefined,
        category_id: categoryId ? parseInt(categoryId, 10) : undefined,
        tags: tagsArray,
        status: statusToSet,
      };

      const res = await blogApi.createBlog(payload);
      if (statusToSet === "PUBLISHED") {
        navigate(`/blog/${res.slug}`);
      } else {
        navigate("/dashboard/blogs");
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container px-4 px-lg-5 py-5" style={{ maxWidth: "980px" }}>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 className="fw-bold mb-1">Create Technical Article</h2>
          <span className="text-muted small">Share your engineering expertise with DevNova readers</span>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSave("DRAFT")}
            className="btn btn-outline-dev btn-sm px-3"
          >
            Save Draft
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSave("PUBLISHED")}
            className="btn btn-primary-gradient btn-sm px-4"
          >
            {submitting ? "Publishing..." : "Publish Article"}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-4">
          <i className="bi bi-exclamation-triangle-fill flex-shrink-0"></i>
          <div>{error}</div>
        </div>
      )}

      <div className="row g-4">
        {/* Editor Main Column */}
        <div className="col-12 col-lg-8">
          <div className="dev-card p-4 mb-4">
            {/* Title */}
            <div className="mb-3">
              <label className="form-label small fw-semibold">Article Title *</label>
              <input
                type="text"
                className="form-control form-control-lg bg-transparent fw-bold"
                placeholder="e.g., Architecting High-Throughput Microservices in Python"
                value={title}
                onChange={handleTitleChange}
                style={{ borderColor: "var(--dn-border)" }}
                required
              />
            </div>

            {/* Custom Slug */}
            <div className="mb-3">
              <label className="form-label small fw-semibold text-muted">URL Slug</label>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-transparent text-muted" style={{ borderColor: "var(--dn-border)" }}>
                  /blog/
                </span>
                <input
                  type="text"
                  className="form-control bg-transparent text-muted"
                  placeholder="custom-url-slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  style={{ borderColor: "var(--dn-border)" }}
                />
              </div>
            </div>

            {/* Excerpt */}
            <div className="mb-4">
              <label className="form-label small fw-semibold">Summary / Excerpt</label>
              <textarea
                className="form-control bg-transparent"
                rows="2"
                placeholder="A concise synopsis of what developers will learn in this article..."
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                style={{ borderColor: "var(--dn-border)" }}
              />
            </div>

            {/* Content Tabs (Write vs Preview) */}
            <div className="mb-2 d-flex justify-content-between align-items-center border-bottom pb-2" style={{ borderColor: "var(--dn-border)" }}>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className={`btn btn-sm ${activeTab === "write" ? "btn-primary-gradient text-white" : "btn-outline-dev"}`}
                  onClick={() => setActiveTab("write")}
                >
                  <i className="bi bi-pencil-square me-1"></i> Write
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${activeTab === "preview" ? "btn-primary-gradient text-white" : "btn-outline-dev"}`}
                  onClick={() => setActiveTab("preview")}
                >
                  <i className="bi bi-eye me-1"></i> Preview
                </button>
              </div>

              {/* Counters */}
              <div className="text-muted small">
                <span>{wordCount} words</span> &bull; <span>~{estimatedReadingTime} min read</span>
              </div>
            </div>

            {activeTab === "write" ? (
              <div>
                <textarea
                  className="form-control bg-transparent font-monospace"
                  rows="16"
                  placeholder="## Introduction&#10;&#10;Write your deep-dive here. Use markdown for headings (##), code snippets (```python ... ```), and lists..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  style={{ borderColor: "var(--dn-border)", fontSize: "0.95rem" }}
                  required
                />
              </div>
            ) : (
              <div className="p-4 rounded-3 border bg-body-tertiary" style={{ minHeight: "380px", borderColor: "var(--dn-border)" }}>
                {content ? (
                  content.split("\n\n").map((p, i) => (
                    <p key={i}>{p}</p>
                  ))
                ) : (
                  <span className="text-muted fst-italic">Nothing to preview yet. Switch to Write tab to begin.</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Settings Sidebar Column */}
        <div className="col-12 col-lg-4">
          <div className="dev-card p-4 mb-4">
            <h6 className="fw-bold mb-3 border-bottom pb-2" style={{ borderColor: "var(--dn-border)" }}>
              Publishing Options
            </h6>

            {/* Category */}
            <div className="mb-3">
              <label className="form-label small fw-semibold">Category *</label>
              <select
                className="form-select bg-transparent"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                style={{ borderColor: "var(--dn-border)" }}
                required
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id} className="text-dark">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div className="mb-3">
              <label className="form-label small fw-semibold">Tags</label>
              <input
                type="text"
                className="form-control form-control-sm bg-transparent"
                placeholder="fastapi, python, postgresql"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                style={{ borderColor: "var(--dn-border)" }}
              />
              <span className="text-muted" style={{ fontSize: "0.72rem" }}>
                Separate tags with commas.
              </span>
            </div>

            {/* Cover Image */}
            <div className="mb-3">
              <label className="form-label small fw-semibold">Cover Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="form-control form-control-sm bg-transparent mb-2"
                style={{ borderColor: "var(--dn-border)" }}
              />
              {uploadingImage && <span className="small text-muted d-block mb-2">Uploading image...</span>}

              <div className="input-group input-group-sm">
                <span className="input-group-text bg-transparent text-muted" style={{ borderColor: "var(--dn-border)" }}>
                  <i className="bi bi-link-45deg"></i>
                </span>
                <input
                  type="url"
                  className="form-control bg-transparent"
                  placeholder="Or paste image URL"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  style={{ borderColor: "var(--dn-border)" }}
                />
              </div>

              {coverImage && (
                <div className="mt-3 rounded-3 overflow-hidden border" style={{ maxHeight: "140px", borderColor: "var(--dn-border)" }}>
                  <img src={coverImage} alt="Cover Preview" className="w-100 h-100 object-fit-cover" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
