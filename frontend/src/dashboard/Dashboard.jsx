import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { userApi } from "../services/userApi";
import { blogApi } from "../services/blogApi";
import { useAuth } from "../context/AuthContext";
import { formatCount, formatDate } from "../utils/helpers";

export const Dashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsData, blogsData] = await Promise.all([
        userApi.getAuthorAnalytics(),
        blogApi.getMyBlogs({ limit: 5 }),
      ]);
      setAnalytics(analyticsData);
      setRecentBlogs(blogsData.items || []);
      document.title = "Dashboard — DevNova";
    } catch (err) {
      console.error("Failed to load dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  const statCards = [
    { label: "Total Articles", count: analytics?.total_blogs || 0, icon: "bi-journal-code", color: "text-primary" },
    { label: "Published", count: analytics?.published_blogs || 0, icon: "bi-check2-circle", color: "text-success" },
    { label: "Drafts", count: analytics?.draft_blogs || 0, icon: "bi-file-earmark-text", color: "text-warning" },
    { label: "Total Views", count: formatCount(analytics?.total_views || 0), icon: "bi-eye", color: "text-info" },
    { label: "Total Likes", count: formatCount(analytics?.total_likes || 0), icon: "bi-heart-fill", color: "text-danger" },
    { label: "Followers", count: formatCount(analytics?.followers_count || 0), icon: "bi-people-fill", color: "text-primary" },
  ];

  return (
    <div>
      {/* Top Banner */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Welcome back, {user?.first_name}!</h2>
          <p className="text-muted small mb-0">Here is an overview of your publication performance and readership.</p>
        </div>

        <Link to="/dashboard/blog/create" className="btn btn-primary-gradient d-flex align-items-center gap-2">
          <i className="bi bi-pencil-square"></i>
          <span>Create New Article</span>
        </Link>
      </div>

      {/* Metrics Cards */}
      <div className="row g-3 mb-4">
        {statCards.map((stat, i) => (
          <div key={i} className="col-12 col-sm-6 col-xl-2">
            <div className="dev-card p-3 h-100">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-muted small fw-medium">{stat.label}</span>
                <i className={`bi ${stat.icon} ${stat.color} fs-5`}></i>
              </div>
              <h4 className="fw-bold mb-0">{stat.count}</h4>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="row g-4 mb-4">
        {/* Views Over Time */}
        <div className="col-12 col-lg-6">
          <div className="dev-card p-4 h-100">
            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-bar-chart-line text-info"></i>
              <span>Views Over Time (Last 7 Days)</span>
            </h6>
            <div className="d-flex align-items-end justify-content-between gap-2 pt-4 pb-2" style={{ height: "160px" }}>
              {analytics?.views_over_time?.map((pt, i) => {
                const maxVal = Math.max(...(analytics.views_over_time.map((p) => p.count) || [10]), 10);
                const heightPercent = Math.max(12, Math.round((pt.count / maxVal) * 100));
                return (
                  <div key={i} className="d-flex flex-column align-items-center flex-grow-1 h-100 justify-content-end">
                    <span className="small text-muted mb-1" style={{ fontSize: "0.68rem" }}>{pt.count}</span>
                    <div
                      className="w-100 rounded-top"
                      style={{
                        height: `${heightPercent}%`,
                        background: "linear-gradient(180deg, #38bdf8 0%, #0284c7 100%)",
                        transition: "height 0.3s ease",
                      }}
                      title={`${pt.date}: ${pt.count} views`}
                    ></div>
                    <span className="text-muted small mt-2" style={{ fontSize: "0.7rem" }}>{pt.date}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Likes Over Time */}
        <div className="col-12 col-lg-6">
          <div className="dev-card p-4 h-100">
            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-heart text-danger"></i>
              <span>Likes Over Time (Last 7 Days)</span>
            </h6>
            <div className="d-flex align-items-end justify-content-between gap-2 pt-4 pb-2" style={{ height: "160px" }}>
              {analytics?.likes_over_time?.map((pt, i) => {
                const maxVal = Math.max(...(analytics.likes_over_time.map((p) => p.count) || [5]), 5);
                const heightPercent = Math.max(12, Math.round((pt.count / maxVal) * 100));
                return (
                  <div key={i} className="d-flex flex-column align-items-center flex-grow-1 h-100 justify-content-end">
                    <span className="small text-muted mb-1" style={{ fontSize: "0.68rem" }}>{pt.count}</span>
                    <div
                      className="w-100 rounded-top"
                      style={{
                        height: `${heightPercent}%`,
                        background: "linear-gradient(180deg, #f43f5e 0%, #be123c 100%)",
                        transition: "height 0.3s ease",
                      }}
                      title={`${pt.date}: ${pt.count} likes`}
                    ></div>
                    <span className="text-muted small mt-2" style={{ fontSize: "0.7rem" }}>{pt.date}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Articles */}
      <div className="dev-card p-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h5 className="fw-bold mb-0">Recent Publications</h5>
          <Link to="/dashboard/blogs" className="small text-primary text-decoration-none">
            View All ({analytics?.total_blogs || 0}) &rarr;
          </Link>
        </div>

        {recentBlogs.length === 0 ? (
          <div className="text-center py-4 text-muted small">
            No articles created yet. Click "Create New Article" to write your first technical piece!
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-dev mb-0">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Views</th>
                  <th>Likes</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentBlogs.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <span className="fw-semibold text-truncate d-block" style={{ maxWidth: "300px" }}>
                        {b.title}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${b.status === "PUBLISHED" ? "bg-success" : "bg-warning text-dark"}`}>
                        {b.status}
                      </span>
                    </td>
                    <td>{formatCount(b.views)}</td>
                    <td>{b.likes_count || 0}</td>
                    <td className="small text-muted">{formatDate(b.created_at)}</td>
                    <td>
                      <div className="d-flex gap-2">
                        {b.status === "PUBLISHED" && (
                          <Link to={`/blog/${b.slug}`} className="btn btn-outline-dev btn-sm py-0 px-2" title="View">
                            <i className="bi bi-eye"></i>
                          </Link>
                        )}
                        <Link to={`/dashboard/blog/${b.id}/edit`} className="btn btn-outline-dev btn-sm py-0 px-2" title="Edit">
                          <i className="bi bi-pencil"></i>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
