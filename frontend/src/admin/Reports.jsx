import React, { useState, useEffect } from "react";
import { adminApi } from "../services/adminApi";
import { formatDate } from "../utils/helpers";
import { Pagination } from "../components/Pagination";

export const Reports = () => {
  const [reports, setReports] = useState([]);
  const [meta, setMeta] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, [statusFilter, page]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getReports({
        status: statusFilter || undefined,
        page,
        limit: 10,
      });
      setReports(res.items || []);
      setMeta(res.meta || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (reportId, newStatus) => {
    try {
      await adminApi.updateReportStatus(reportId, newStatus);
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status: newStatus } : r))
      );
    } catch (err) {
      alert("Failed to update report status.");
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Content Moderation & Reports</h2>
        <span className="text-muted small">Review user reports for spam, abuse, copyright violations, and misleading content</span>
      </div>

      {/* Filter Tabs */}
      <div className="d-flex gap-2 mb-4">
        <button
          onClick={() => { setStatusFilter(""); setPage(1); }}
          className={`btn btn-sm ${statusFilter === "" ? "btn-primary-gradient text-white" : "btn-outline-dev"}`}
        >
          All Reports
        </button>
        <button
          onClick={() => { setStatusFilter("PENDING"); setPage(1); }}
          className={`btn btn-sm ${statusFilter === "PENDING" ? "btn-primary-gradient text-white" : "btn-outline-dev"}`}
        >
          Pending
        </button>
        <button
          onClick={() => { setStatusFilter("RESOLVED"); setPage(1); }}
          className={`btn btn-sm ${statusFilter === "RESOLVED" ? "btn-primary-gradient text-white" : "btn-outline-dev"}`}
        >
          Resolved
        </button>
        <button
          onClick={() => { setStatusFilter("REJECTED"); setPage(1); }}
          className={`btn btn-sm ${statusFilter === "REJECTED" ? "btn-primary-gradient text-white" : "btn-outline-dev"}`}
        >
          Rejected
        </button>
      </div>

      <div className="dev-card p-0 overflow-hidden mb-4">
        {loading ? (
          <div className="p-5 text-center">
            <div className="spinner-border text-primary" role="status"></div>
          </div>
        ) : reports.length === 0 ? (
          <div className="p-5 text-center text-muted">
            <i className="bi bi-shield-check fs-1 text-dim d-block mb-3"></i>
            <p>No content reports found for the selected status.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-dev mb-0">
              <thead>
                <tr>
                  <th>Reason</th>
                  <th>Target Type</th>
                  <th>Reporter</th>
                  <th>Details</th>
                  <th>Status</th>
                  <th>Reported Date</th>
                  <th>Resolution</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <span className="fw-semibold text-danger">{r.reason}</span>
                    </td>
                    <td>
                      {r.blog_id ? (
                        <span className="badge bg-primary-subtle text-primary">Article: {r.blog_title || `#${r.blog_id}`}</span>
                      ) : r.comment_id ? (
                        <span className="badge bg-info-subtle text-info">Comment #{r.comment_id}</span>
                      ) : (
                        <span className="badge bg-secondary-subtle">User @{r.reported_username}</span>
                      )}
                    </td>
                    <td className="small">@{r.reporter_username}</td>
                    <td className="small text-muted" style={{ maxWidth: "200px" }}>
                      {r.details || "None provided"}
                    </td>
                    <td>
                      <span className={`badge ${
                        r.status === "PENDING"
                          ? "bg-warning text-dark"
                          : r.status === "RESOLVED"
                          ? "bg-success"
                          : "bg-secondary"
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="small text-muted">{formatDate(r.created_at)}</td>
                    <td>
                      <div className="d-flex gap-2">
                        {r.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => handleStatusChange(r.id, "RESOLVED")}
                              className="btn btn-outline-success btn-sm py-0 px-2"
                              title="Resolve report"
                              style={{ fontSize: "0.75rem" }}
                            >
                              Resolve
                            </button>
                            <button
                              onClick={() => handleStatusChange(r.id, "REJECTED")}
                              className="btn btn-outline-secondary btn-sm py-0 px-2"
                              title="Reject report"
                              style={{ fontSize: "0.75rem" }}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {r.status !== "PENDING" && (
                          <span className="text-muted small fst-italic">Completed</span>
                        )}
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
