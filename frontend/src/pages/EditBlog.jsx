import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { blogApi } from "../services/blogApi";
import { getErrorMessage } from "../services/api";

export const EditBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState("write");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadBlogData();
  }, [id]);

  const loadBlogData = async () => {
    try {
      setLoading(true);
      const [blogData, cats] = await Promise.all([
        blogApi.getBlogBySlug(id),
        blogApi.getCategories(),
      ]);

      setTitle(blogData.title);
      setSlug(blogData.slug);
      setExcerpt(blogData.excerpt || "");
      setContent(blogData.content || "");
      setCategoryId(blogData.category_id ? blogData.category_id.toString() : "");
      setCoverImage(blogData.cover_image || "");
      setStatus(blogData.status || "DRAFT");
      setTagsInput(blogData.tags ? blogData.tags.map((t) => t.name).join(", ") : "");
      setCategories(cats || []);
    } catch (err) {
      setError("Failed to load article details for editing.");
    } finally {
      setLoading(false);
    }
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

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const estimatedReadingTime = Math.max(1, Math.ceil(wordCount / 200));

  const handleUpdate = async (statusToSet) => {
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!content.trim()) {
      setError("Content cannot be empty.");
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

      const res = await blogApi.updateBlog(id, payload);
      navigate(`/blog/${res.slug}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary my-5" role="status"></div>
      </div>
    );
  }

  return (
    <div className="container px-4 px-lg-5 py-5" style={{ maxWidth: "980px" }}>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 className="fw-bold mb-1">Edit Article</h2>
          <span className="text-muted small">Update and refine your engineering publication</span>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleUpdate("DRAFT")}
            className="btn btn-outline-dev btn-sm px-3"
          >
            Save as Draft
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleUpdate("PUBLISHED")}
            className="btn btn-primary-gradient btn-sm px-4"
          >
            {submitting ? "Updating..." : "Update & Publish"}
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
        <div className="col-12 col-lg-8">
          <div className="dev-card p-4 mb-4">
            <div className="mb-3">
              <label className="form-label small fw-semibold">Article Title *</label>
              <input
                type="text"
                className="form-control form-control-lg bg-transparent fw-bold"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ borderColor: "var(--dn-border)" }}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold text-muted">Slug</label>
              <input
                type="text"
                className="form-control form-control-sm bg-transparent text-muted"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                style={{ borderColor: "var(--dn-border)" }}
              />
            </div>

            <div className="mb-4">
              <label className="form-label small fw-semibold">Excerpt</label>
              <textarea
                className="form-control bg-transparent"
                rows="2"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                style={{ borderColor: "var(--dn-border)" }}
              />
            </div>

            <div className="mb-2 d-flex justify-content-between align-items-center border-bottom pb-2" style={{ borderColor: "var(--dn-border)" }}>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className={`btn btn-sm ${activeTab === "write" ? "btn-primary-gradient text-white" : "btn-outline-dev"}`}
                  onClick={() => setActiveTab("write")}
                >
                  Write
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${activeTab === "preview" ? "btn-primary-gradient text-white" : "btn-outline-dev"}`}
                  onClick={() => setActiveTab("preview")}
                >
                  Preview
                </button>
              </div>
              <div className="text-muted small">
                <span>{wordCount} words</span> &bull; <span>~{estimatedReadingTime} min read</span>
              </div>
            </div>

            {activeTab === "write" ? (
              <textarea
                className="form-control bg-transparent font-monospace"
                rows="16"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={{ borderColor: "var(--dn-border)", fontSize: "0.95rem" }}
                required
              />
            ) : (
              <div className="p-4 rounded-3 border bg-body-tertiary" style={{ minHeight: "380px", borderColor: "var(--dn-border)" }}>
                {content.split("\n\n").map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="dev-card p-4 mb-4">
            <h6 className="fw-bold mb-3 border-bottom pb-2" style={{ borderColor: "var(--dn-border)" }}>
              Publishing Options
            </h6>

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

            <div className="mb-3">
              <label className="form-label small fw-semibold">Tags</label>
              <input
                type="text"
                className="form-control form-control-sm bg-transparent"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                style={{ borderColor: "var(--dn-border)" }}
              />
            </div>

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

              <input
                type="url"
                className="form-control form-control-sm bg-transparent"
                placeholder="Or paste image URL"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                style={{ borderColor: "var(--dn-border)" }}
              />

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
