import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../services/adminApi";
import { formatCount } from "../utils/helpers";

export const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getAdminAnalytics();
      setAnalytics(res);
      document.title = "Admin Console — DevNova";
    } catch (err) {
      console.error(err);
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
    { label: "Total Users", count: analytics?.total_users || 0, icon: "bi-people", link: "/admin/users" },
    { label: "Authors", count: analytics?.total_authors || 0, icon: "bi-pencil", link: "/admin/users" },
    { label: "Total Articles", count: analytics?.total_blogs || 0, icon: "bi-journal-code", link: "/admin/blogs" },
    { label: "Published", count: analytics?.published_blogs || 0, icon: "bi-check-circle", link: "/admin/blogs" },
    { label: "Drafts", count: analytics?.draft_blogs || 0, icon: "bi-file-earmark", link: "/admin/blogs" },
    { label: "Total Reads", count: formatCount(analytics?.total_views || 0), icon: "bi-eye", link: "/admin/analytics" },
    { label: "Comments", count: analytics?.total_comments || 0, icon: "bi-chat-dots", link: "/admin/analytics" },
    { label: "Pending Reports", count: analytics?.pending_reports || 0, icon: "bi-flag-fill text-danger", link: "/admin/reports" },
  ];

  return (
    <div>
      <div className="mb-4">
        <div className="d-flex align-items-center gap-2 mb-1">
          <span className="badge bg-danger">ADMINISTRATOR</span>
          <h2 className="fw-bold mb-0">Platform Governance Overview</h2>
        </div>
        <p className="text-muted small">DevNova real-time ecosystem telemetry and administrative controls</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="row g-3 mb-4">
        {statCards.map((stat, i) => (
          <div key={i} className="col-12 col-sm-6 col-md-4 col-xl-3">
            <Link to={stat.link} className="text-decoration-none">
              <div className="dev-card p-3 h-100">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="text-muted small fw-medium">{stat.label}</span>
                  <i className={`bi ${stat.icon} fs-5`}></i>
                </div>
                <h3 className="fw-bold mb-0 text-body">{stat.count}</h3>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Quick Action Hub */}
      <div className="row g-4">
        <div className="col-12 col-lg-6">
          <div className="dev-card p-4 h-100">
            <h5 className="fw-bold mb-3">Governance Actions</h5>
            <div className="d-flex flex-column gap-2">
              <Link to="/admin/users" className="btn btn-outline-dev text-start d-flex align-items-center justify-content-between">
                <span><i className="bi bi-people me-2"></i> Manage User Accounts & Roles</span>
                <i className="bi bi-chevron-right text-muted"></i>
              </Link>
              <Link to="/admin/blogs" className="btn btn-outline-dev text-start d-flex align-items-center justify-content-between">
                <span><i className="bi bi-journals me-2"></i> Review & Moderate Articles</span>
                <i className="bi bi-chevron-right text-muted"></i>
              </Link>
              <Link to="/admin/categories" className="btn btn-outline-dev text-start d-flex align-items-center justify-content-between">
                <span><i className="bi bi-tags me-2"></i> Configure Categories & Taxonomies</span>
                <i className="bi bi-chevron-right text-muted"></i>
              </Link>
              <Link to="/admin/reports" className="btn btn-outline-dev text-start d-flex align-items-center justify-content-between">
                <span><i className="bi bi-flag me-2"></i> Process Abuse & Content Reports</span>
                <span className="badge bg-danger rounded-pill">{analytics?.pending_reports || 0} pending</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="dev-card p-4 h-100">
            <h5 className="fw-bold mb-3">Popular Categories</h5>
            <div className="d-flex flex-column gap-2">
              {analytics?.top_categories?.map((cat) => (
                <div key={cat.id} className="d-flex align-items-center justify-content-between py-2 border-bottom" style={{ borderColor: "var(--dn-border)" }}>
                  <span className="fw-semibold">{cat.name}</span>
                  <span className="badge badge-tech">{cat.blogs_count} articles</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
