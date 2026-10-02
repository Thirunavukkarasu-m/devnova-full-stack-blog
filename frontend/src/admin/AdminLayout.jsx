import React, { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const AdminLayout = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const adminNav = [
    { to: "/admin", icon: "bi-shield-check", label: "Admin Overview", end: true },
    { to: "/admin/users", icon: "bi-people", label: "User Management" },
    { to: "/admin/blogs", icon: "bi-journals", label: "Blog Management" },
    { to: "/admin/categories", icon: "bi-tags", label: "Categories" },
    { to: "/admin/reports", icon: "bi-flag", label: "Content Reports" },
    { to: "/admin/analytics", icon: "bi-graph-up", label: "Platform Analytics" },
  ];

  return (
    <div className="container-fluid px-0">
      <div className="row g-0">
        {/* Mobile Header */}
        <div className="d-lg-none p-3 border-bottom d-flex align-items-center justify-content-between" style={{ borderColor: "var(--dn-border)", backgroundColor: "var(--dn-surface)" }}>
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-danger">ADMIN</span>
            <span className="fw-bold">DevNova Control Console</span>
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="btn btn-outline-dev btn-sm">
            <i className={`bi ${sidebarOpen ? "bi-x-lg" : "bi-list"}`}></i>
          </button>
        </div>

        {/* Admin Sidebar */}
        <div
          className={`col-12 col-lg-2 border-end p-3 ${sidebarOpen ? "d-block" : "d-none d-lg-block"}`}
          style={{
            borderColor: "var(--dn-border)",
            backgroundColor: "var(--dn-surface)",
            minHeight: "calc(100vh - 75px)",
          }}
        >
          <div className="p-2 mb-3 rounded dev-card border-danger-subtle">
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-shield-shaded text-danger fs-4"></i>
              <div>
                <div className="fw-bold small">Admin Console</div>
                <div className="text-muted" style={{ fontSize: "0.7rem" }}>Platform Governance</div>
              </div>
            </div>
          </div>

          <div className="nav flex-column gap-1">
            {adminNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `nav-link d-flex align-items-center gap-2 px-3 py-2 rounded-3 text-decoration-none ${
                    isActive ? "btn-primary-gradient text-white fw-semibold" : "text-body hover-surface"
                  }`
                }
              >
                <i className={`bi ${item.icon}`}></i>
                <span>{item.label}</span>
              </NavLink>
            ))}

            <hr className="my-3" style={{ borderColor: "var(--dn-border)" }} />
            <Link to="/dashboard" className="nav-link text-body d-flex align-items-center gap-2 px-3 py-2">
              <i className="bi bi-arrow-left"></i>
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>

        {/* Content Area */}
        <div className="col-12 col-lg-10 p-4 p-md-5">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
