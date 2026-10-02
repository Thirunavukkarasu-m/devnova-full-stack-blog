import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../services/adminApi";
import { formatCount, formatDate } from "../utils/helpers";
import { Pagination } from "../components/Pagination";

export const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [meta, setMeta] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBlogs();
  }, [statusFilter, page]);

  const loadBlogs = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getAdminBlogs({
        search: search || undefined,
        status: statusFilter || undefined,
        page,
        limit: 10,
      });
      setBlogs(res.items || []);
      setMeta(res.meta || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadBlogs();
  };

  const handleStatusChange = async (blogId, newStatus) => {
    try {
      const updated = await adminApi.updateBlogStatus(blogId, newStatus);
      setBlogs((prev) => prev.map((b) => (b.id === blogId ? { ...b, status: updated.status } : b)));
    } catch (err) {
      alert("Failed to update blog status.");
    }
  };

  const handleDelete = async (blogId) => {
    if (!window.confirm("Permanently delete this blog?")) return;
    try {
      await adminApi.deleteAdminBlog(blogId);
      setBlogs((prev) => prev.filter((b) => b.id !== blogId));
    } catch (err) {
      alert("Failed to delete blog.");
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Blog Management</h2>
        <span className="text-muted small">Moderate publications, approve articles, and manage platform posts</span>
      </div>

      <div className="dev-card p-3 mb-4">
        <form onSubmit={handleSearchSubmit} className="row g-2 align-items-center">
          <div className="col-12 col-md-6">
            <input
              type="text"
              className="form-control form-control-sm bg-transparent"
              placeholder="Search by title, author, or slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ borderColor: "var(--dn-border)" }}
            />
          </div>
          <div className="col-6 col-md-3">
            <select
              className="form-select form-select-sm bg-transparent"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              style={{ borderColor: "var(--dn-border)" }}
            >
              <option value="">All Statuses</option>
              <option value="PUBLISHED" className="text-dark">PUBLISHED</option>
              <option value="DRAFT" className="text-dark">DRAFT</option>
              <option value="ARCHIVED" className="text-dark">ARCHIVED</option>
            </select>
          </div>
          <div className="col-6 col-md-3">
            <button type="submit" className="btn btn-primary-gradient btn-sm w-100">
              Filter
            </button>
          </div>
        </form>
      </div>

      <div className="dev-card p-0 overflow-hidden mb-4">
        {loading ? (
          <div className="p-5 text-center">
            <div className="spinner-border text-primary" role="status"></div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-dev mb-0">
              <thead>
                <tr>
                  <th>Article</th>
                  <th>Author</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Views</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {blogs.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <span className="fw-semibold text-truncate d-block" style={{ maxWidth: "260px" }}>
                        {b.title}
                      </span>
                    </td>
                    <td className="small">@{b.author?.username}</td>
                    <td><span className="badge badge-tech">{b.category?.name || "None"}</span></td>
                    <td>
                      <select
                        className="form-select form-select-sm bg-transparent py-0"
                        value={b.status}
                        onChange={(e) => handleStatusChange(b.id, e.target.value)}
                        style={{ fontSize: "0.75rem", width: "115px", borderColor: "var(--dn-border)" }}
                      >
                        <option value="PUBLISHED" className="text-dark">PUBLISHED</option>
                        <option value="DRAFT" className="text-dark">DRAFT</option>
                        <option value="ARCHIVED" className="text-dark">ARCHIVED</option>
                      </select>
                    </td>
                    <td>{formatCount(b.views)}</td>
                    <td className="small text-muted">{formatDate(b.created_at)}</td>
                    <td>
                      <div className="d-flex gap-2">
                        {b.status === "PUBLISHED" && (
                          <Link to={`/blog/${b.slug}`} className="btn btn-outline-dev btn-sm py-0 px-2" title="View">
                            <i className="bi bi-eye"></i>
                          </Link>
                        )}
                        <button
                          onClick={() => handleDelete(b.id)}
                          className="btn btn-outline-danger btn-sm py-0 px-2"
                          title="Delete"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination meta={meta} onPageChange={(p) => setPage(p)} />
    </div>
  );
};
