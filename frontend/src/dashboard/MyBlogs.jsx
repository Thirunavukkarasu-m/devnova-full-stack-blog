import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { blogApi } from "../services/blogApi";
import { formatCount, formatDate } from "../utils/helpers";
import { Pagination } from "../components/Pagination";

export const MyBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [meta, setMeta] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadMyBlogs();
  }, [statusFilter, page]);

  const loadMyBlogs = async () => {
    try {
      setLoading(true);
      const res = await blogApi.getMyBlogs({
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

  const handleDelete = async (blogId) => {
    if (!window.confirm("Are you sure you want to permanently delete this article?")) return;
    setDeletingId(blogId);
    try {
      await blogApi.deleteBlog(blogId);
      setBlogs((prev) => prev.filter((b) => b.id !== blogId));
    } catch (err) {
      alert("Failed to delete article.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">My Articles</h2>
          <span className="text-muted small">Manage your drafts and published technical guides</span>
        </div>

        <Link to="/dashboard/blog/create" className="btn btn-primary-gradient d-flex align-items-center gap-2">
          <i className="bi bi-plus-lg"></i>
          <span>New Article</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="d-flex gap-2 mb-4">
        <button
          onClick={() => { setStatusFilter(""); setPage(1); }}
          className={`btn btn-sm ${statusFilter === "" ? "btn-primary-gradient text-white" : "btn-outline-dev"}`}
        >
          All
        </button>
        <button
          onClick={() => { setStatusFilter("PUBLISHED"); setPage(1); }}
          className={`btn btn-sm ${statusFilter === "PUBLISHED" ? "btn-primary-gradient text-white" : "btn-outline-dev"}`}
        >
          Published
        </button>
        <button
          onClick={() => { setStatusFilter("DRAFT"); setPage(1); }}
          className={`btn btn-sm ${statusFilter === "DRAFT" ? "btn-primary-gradient text-white" : "btn-outline-dev"}`}
        >
          Drafts
        </button>
      </div>

      {/* Articles Table */}
      <div className="dev-card p-0 overflow-hidden mb-4">
        {loading ? (
          <div className="p-5 text-center">
            <div className="spinner-border text-primary" role="status"></div>
          </div>
        ) : blogs.length === 0 ? (
          <div className="p-5 text-center text-muted">
            <i className="bi bi-file-earmark-text fs-1 text-dim d-block mb-3"></i>
            <p>No articles found for the selected status.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-dev mb-0">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Views</th>
                  <th>Likes</th>
                  <th>Comments</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {blogs.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        {b.cover_image && (
                          <img
                            src={b.cover_image}
                            alt=""
                            className="rounded"
                            style={{ width: "36px", height: "36px", objectFit: "cover" }}
                          />
                        )}
                        <span className="fw-semibold text-truncate" style={{ maxWidth: "260px" }}>
                          {b.title}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-tech">
                        {b.category?.name || "General"}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${b.status === "PUBLISHED" ? "bg-success" : "bg-warning text-dark"}`}>
                        {b.status}
                      </span>
                    </td>
                    <td>{formatCount(b.views)}</td>
                    <td>{b.likes_count || 0}</td>
                    <td>{b.comments_count || 0}</td>
                    <td className="small text-muted">{formatDate(b.created_at)}</td>
                    <td>
                      <div className="d-flex gap-2">
                        {b.status === "PUBLISHED" && (
                          <Link to={`/blog/${b.slug}`} className="btn btn-outline-dev btn-sm py-1 px-2" title="View Article">
                            <i className="bi bi-eye"></i>
                          </Link>
                        )}
                        <Link to={`/dashboard/blog/${b.id}/edit`} className="btn btn-outline-dev btn-sm py-1 px-2" title="Edit Article">
                          <i className="bi bi-pencil"></i>
                        </Link>
                        <button
                          onClick={() => handleDelete(b.id)}
                          disabled={deletingId === b.id}
                          className="btn btn-outline-dev btn-sm text-danger py-1 px-2"
                          title="Delete Article"
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
