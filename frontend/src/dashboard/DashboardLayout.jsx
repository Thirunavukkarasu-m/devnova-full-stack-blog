import React, { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const DashboardLayout = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navItems = [
    { to: "/dashboard", icon: "bi-speedometer2", label: "Overview", end: true },
    { to: "/dashboard/blogs", icon: "bi-journal-text", label: "My Articles" },
    { to: "/dashboard/blog/create", icon: "bi-pencil-square", label: "Write Article" },
    { to: "/dashboard/analytics", icon: "bi-graph-up-arrow", label: "Analytics" },
    { to: "/dashboard/bookmarks", icon: "bi-bookmark", label: "Bookmarks" },
    { to: "/dashboard/notifications", icon: "bi-bell", label: "Notifications" },
    { to: "/dashboard/profile", icon: "bi-person-circle", label: "Profile" },
    { to: "/dashboard/settings", icon: "bi-gear", label: "Settings" },
  ];

  return (
    <div className="container-fluid px-0">
      <div className="row g-0">
        {/* Mobile Sidebar Toggle Header */}
        <div className="d-lg-none p-3 border-bottom d-flex align-items-center justify-content-between" style={{ borderColor: "var(--dn-border)", backgroundColor: "var(--dn-surface)" }}>
          <div className="d-flex align-items-center gap-2">
            <span className="fw-bold">Author Dashboard</span>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="btn btn-outline-dev btn-sm"
          >
            <i className={`bi ${sidebarOpen ? "bi-x-lg" : "bi-list"}`}></i> Menu
          </button>
        </div>

        {/* Sidebar */}
        <div
          className={`col-12 col-lg-2 border-end p-3 ${sidebarOpen ? "d-block" : "d-none d-lg-block"}`}
          style={{
            borderColor: "var(--dn-border)",
            backgroundColor: "var(--dn-surface)",
            minHeight: "calc(100vh - 75px)",
          }}
        >
          {/* User mini banner */}
          <div className="d-flex align-items-center gap-2 p-2 mb-3 rounded dev-card">
            <img
              src={user?.profile_image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"}
              alt={user?.username}
              className="rounded-circle"
              style={{ width: "36px", height: "36px", objectFit: "cover" }}
            />
            <div className="overflow-hidden">
              <div className="fw-bold small text-truncate">{user?.first_name} {user?.last_name}</div>
              <div className="text-muted" style={{ fontSize: "0.7rem" }}>@{user?.username}</div>
            </div>
          </div>

          <div className="nav flex-column gap-1">
            {navItems.map((item) => (
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

            {isAdmin && (
              <>
                <hr className="my-2" style={{ borderColor: "var(--dn-border)" }} />
                <Link
                  to="/admin"
                  className="nav-link text-danger d-flex align-items-center gap-2 px-3 py-2 rounded-3"
                >
                  <i className="bi bi-shield-lock-fill"></i>
                  <span>Admin Panel</span>
                </Link>
              </>
            )}

            <hr className="my-2" style={{ borderColor: "var(--dn-border)" }} />
            <button
              onClick={handleLogout}
              className="nav-link text-danger d-flex align-items-center gap-2 px-3 py-2 rounded-3 border-0 bg-transparent text-start w-100"
            >
              <i className="bi bi-box-arrow-right"></i>
              <span>Logout</span>
            </button>
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
