import React, { useState, useEffect } from "react";
import { blogApi } from "../services/blogApi";
import { adminApi } from "../services/adminApi";
import { getErrorMessage } from "../services/api";

export const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await blogApi.getCategories();
      setCategories(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (cat = null) => {
    setError("");
    if (cat) {
      setEditingCategory(cat);
      setName(cat.name);
      setDescription(cat.description || "");
      setImage(cat.image || "");
    } else {
      setEditingCategory(null);
      setName("");
      setDescription("");
      setImage("");
    }
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError("");

    try {
      if (editingCategory) {
        await adminApi.updateCategory(editingCategory.id, {
          name: name.trim(),
          description: description.trim(),
          image: image.trim() || undefined,
        });
      } else {
        await adminApi.createCategory({
          name: name.trim(),
          description: description.trim(),
          image: image.trim() || undefined,
        });
      }
      setModalOpen(false);
      await loadCategories();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat) => {
    const confirm = window.confirm(`Are you sure you want to delete category "${cat.name}"?`);
    if (!confirm) return;

    try {
      await adminApi.deleteCategory(cat.id, false);
      await loadCategories();
    } catch (err) {
      const msg = getErrorMessage(err);
      if (msg.includes("linked to it")) {
        const force = window.confirm(`${msg}\n\nDo you want to FORCE DELETE and unlink all associated articles?`);
        if (force) {
          await adminApi.deleteCategory(cat.id, true);
          await loadCategories();
        }
      } else {
        alert(msg);
      }
    }
  };

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 className="fw-bold mb-1">Categories Management</h2>
          <span className="text-muted small">Configure and organize technology tracks and topics</span>
        </div>

        <button onClick={() => handleOpenModal()} className="btn btn-primary-gradient btn-sm">
          <i className="bi bi-plus-lg me-1"></i> Add Category
        </button>
      </div>

      <div className="row g-4">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
          </div>
        ) : (
          categories.map((c) => (
            <div key={c.id} className="col-12 col-md-6 col-lg-4">
              <div className="dev-card p-4 h-100 d-flex flex-column">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <img
                    src={c.image || "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=100&q=80"}
                    alt={c.name}
                    className="rounded-3"
                    style={{ width: "48px", height: "48px", objectFit: "cover" }}
                  />
                  <div>
                    <h5 className="fw-bold mb-0">{c.name}</h5>
                    <span className="badge badge-tech">{c.article_count || 0} articles</span>
                  </div>
                </div>

                <p className="small text-muted mb-4 flex-grow-1" style={{ fontSize: "0.85rem" }}>
                  {c.description || "No description provided."}
                </p>

                <div className="d-flex justify-content-end gap-2 pt-2 border-top" style={{ borderColor: "var(--dn-border)" }}>
                  <button
                    onClick={() => handleOpenModal(c)}
                    className="btn btn-outline-dev btn-sm py-1 px-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(c)}
                    className="btn btn-outline-danger btn-sm py-1 px-3"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Category Modal */}
      {modalOpen && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.6)" }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content dev-card border-0">
              <div className="modal-header border-bottom" style={{ borderColor: "var(--dn-border)" }}>
                <h5 className="modal-title fw-bold">
                  {editingCategory ? "Edit Category" : "Add New Category"}
                </h5>
                <button type="button" className="btn-close" onClick={() => setModalOpen(false)}></button>
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body">
                  {error && (
                    <div className="alert alert-danger py-2 px-3 small mb-3">
                      {error}
                    </div>
                  )}
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Category Name *</label>
                    <input
                      type="text"
                      required
                      className="form-control bg-transparent"
                      placeholder="e.g. Distributed Systems"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={{ borderColor: "var(--dn-border)" }}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Description</label>
                    <textarea
                      rows="3"
                      className="form-control bg-transparent"
                      placeholder="Brief summary of articles under this domain..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      style={{ borderColor: "var(--dn-border)" }}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Cover Image URL</label>
                    <input
                      type="url"
                      className="form-control bg-transparent"
                      placeholder="https://images.unsplash.com/..."
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      style={{ borderColor: "var(--dn-border)" }}
                    />
                  </div>
                </div>
                <div className="modal-footer border-top" style={{ borderColor: "var(--dn-border)" }}>
                  <button type="button" className="btn btn-outline-dev btn-sm" onClick={() => setModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="btn btn-primary-gradient btn-sm">
                    {saving ? "Saving..." : "Save Category"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
