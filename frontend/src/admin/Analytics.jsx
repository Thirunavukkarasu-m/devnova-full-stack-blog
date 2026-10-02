import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../services/adminApi";
import { formatCount } from "../utils/helpers";

export const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getAdminAnalytics();
      setData(res);
      document.title = "Platform Analytics — DevNova";
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

  return (
    <div>
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Platform-Wide Analytics</h2>
        <span className="text-muted small">Global viewership patterns, community growth, and content engagement</span>
      </div>

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="dev-card p-4">
            <span className="text-muted small fw-medium">Total Registered Users</span>
            <h3 className="fw-bold my-1 text-primary">{data?.total_users || 0}</h3>
            <span className="text-muted" style={{ fontSize: "0.75rem" }}>
              {data?.total_authors || 0} authors &bull; {data?.total_admins || 0} admins
            </span>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="dev-card p-4">
            <span className="text-muted small fw-medium">Total Reads Generated</span>
            <h3 className="fw-bold my-1 text-info">{formatCount(data?.total_views || 0)}</h3>
            <span className="text-muted" style={{ fontSize: "0.75rem" }}>across entire platform</span>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="dev-card p-4">
            <span className="text-muted small fw-medium">Published Articles</span>
            <h3 className="fw-bold my-1 text-success">{data?.published_blogs || 0}</h3>
            <span className="text-muted" style={{ fontSize: "0.75rem" }}>{data?.draft_blogs || 0} drafts active</span>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="dev-card p-4">
            <span className="text-muted small fw-medium">Community Interactions</span>
            <h3 className="fw-bold my-1 text-danger">{formatCount(data?.total_likes || 0)}</h3>
            <span className="text-muted" style={{ fontSize: "0.75rem" }}>{data?.total_comments || 0} comments</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-lg-6">
          <div className="dev-card p-4 h-100">
            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-graph-up-arrow text-primary"></i>
              <span>Platform Views Trend (Last 7 Days)</span>
            </h6>
            <div className="d-flex align-items-end justify-content-between gap-2 pt-4 pb-2" style={{ height: "180px" }}>
              {data?.views_trend?.map((pt, i) => {
                const maxVal = Math.max(...(data.views_trend.map((p) => p.count) || [10]), 10);
                const heightPercent = Math.max(15, Math.round((pt.count / maxVal) * 100));
                return (
                  <div key={i} className="d-flex flex-column align-items-center flex-grow-1 h-100 justify-content-end">
                    <span className="small text-muted mb-1" style={{ fontSize: "0.68rem" }}>{pt.count}</span>
                    <div
                      className="w-100 rounded-top"
                      style={{
                        height: `${heightPercent}%`,
                        background: "linear-gradient(180deg, #38bdf8 0%, #0284c7 100%)",
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

        <div className="col-12 col-lg-6">
          <div className="dev-card p-4 h-100">
            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-people text-success"></i>
              <span>New User Registrations (Last 7 Days)</span>
            </h6>
            <div className="d-flex align-items-end justify-content-between gap-2 pt-4 pb-2" style={{ height: "180px" }}>
              {data?.user_growth?.map((pt, i) => {
                const maxVal = Math.max(...(data.user_growth.map((p) => p.count) || [5]), 5);
                const heightPercent = Math.max(15, Math.round((pt.count / maxVal) * 100));
                return (
                  <div key={i} className="d-flex flex-column align-items-center flex-grow-1 h-100 justify-content-end">
                    <span className="small text-muted mb-1" style={{ fontSize: "0.68rem" }}>{pt.count}</span>
                    <div
                      className="w-100 rounded-top"
                      style={{
                        height: `${heightPercent}%`,
                        background: "linear-gradient(180deg, #10b981 0%, #047857 100%)",
                      }}
                      title={`${pt.date}: ${pt.count} signups`}
                    ></div>
                    <span className="text-muted small mt-2" style={{ fontSize: "0.7rem" }}>{pt.date}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Top Articles Platform-Wide */}
      <div className="dev-card p-4">
        <h5 className="fw-bold mb-3">Top Articles Platform-Wide</h5>
        <div className="table-responsive">
          <table className="table table-dev mb-0">
            <thead>
              <tr>
                <th>Title</th>
                <th>Views</th>
                <th>Likes</th>
                <th>Comments</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data?.top_articles?.map((art) => (
                <tr key={art.id}>
                  <td>
                    <span className="fw-semibold text-truncate d-block" style={{ maxWidth: "340px" }}>
                      {art.title}
                    </span>
                  </td>
                  <td>{formatCount(art.views)}</td>
                  <td>{art.likes_count}</td>
                  <td>{art.comments_count}</td>
                  <td>
                    <Link to={`/blog/${art.slug}`} className="btn btn-outline-dev btn-sm py-1 px-3">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
