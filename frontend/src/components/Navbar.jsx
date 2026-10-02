import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { userApi } from "../services/userApi";

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, isAuthor, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
    }
  }, [isAuthenticated, location.pathname]);

  const loadNotifications = async () => {
    try {
      const data = await userApi.getNotifications(6);
      setNotifications(data.items || []);
      setUnreadCount(data.unread_count || 0);
    } catch {
      // silently ignore in background
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setMobileMenuOpen(false);
    }
  };

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await userApi.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await userApi.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <nav className="glass-nav py-2 py-md-3">
      <div className="container-fluid px-lg-5">
        <div className="d-flex align-items-center justify-content-between">
          {/* Brand Logo */}
          <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none">
            <div
              className="d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)",
              }}
            >
              <i className="bi bi-code-slash fs-5"></i>
            </div>
            <div>
              <span className="fs-4 fw-extrabold text-gradient" style={{ letterSpacing: "-0.03em" }}>
                DevNova
              </span>
              <span className="d-none d-lg-block text-muted" style={{ fontSize: "0.68rem", marginTop: "-4px" }}>
                Explore. Learn. Build.
              </span>
            </div>
          </Link>

          {/* Desktop Search */}
          <form onSubmit={handleSearchSubmit} className="d-none d-md-flex align-items-center position-relative mx-3" style={{ maxWidth: "320px", width: "100%" }}>
            <i className="bi bi-search position-absolute text-muted" style={{ left: "14px", fontSize: "0.85rem" }}></i>
            <input
              type="text"
              className="form-control ps-5 py-2 bg-transparent text-body"
              placeholder="Search tech articles, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                borderRadius: "20px",
                borderColor: "var(--dn-border)",
                fontSize: "0.85rem",
              }}
            />
          </form>

          {/* Navigation Links */}
          <div className="d-none d-lg-flex align-items-center gap-4">
            <Link to="/" className={`text-decoration-none fw-medium ${location.pathname === "/" ? "text-primary" : "text-body"}`}>
              Home
            </Link>
            <Link to="/explore" className={`text-decoration-none fw-medium ${location.pathname === "/explore" ? "text-primary" : "text-body"}`}>
              Explore
            </Link>
            <Link to="/category/fastapi" className="text-decoration-none text-body fw-medium">
              Categories
            </Link>
          </div>

          {/* Right Action Icons & Auth */}
          <div className="d-flex align-items-center gap-2 gap-md-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="btn btn-outline-dev p-2 d-flex align-items-center justify-content-center"
              style={{ width: "38px", height: "38px", borderRadius: "10px" }}
              title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
            >
              <i className={`bi ${theme === "dark" ? "bi-sun-fill text-warning" : "bi-moon-stars-fill text-primary"}`}></i>
            </button>

            {/* Write Blog Button */}
            {isAuthenticated ? (
              <Link to="/dashboard/blog/create" className="btn btn-primary-gradient d-none d-sm-flex align-items-center gap-2 py-2 px-3">
                <i className="bi bi-pencil-square"></i>
                <span>Write</span>
              </Link>
            ) : null}

            {/* Notifications Dropdown (Logged in) */}
            {isAuthenticated && (
              <div className="position-relative">
                <button
                  onClick={() => {
                    setShowNotifDropdown(!showNotifDropdown);
                    setShowUserDropdown(false);
                  }}
                  className="btn btn-outline-dev p-2 position-relative d-flex align-items-center justify-content-center"
                  style={{ width: "38px", height: "38px", borderRadius: "10px" }}
                >
                  <i className="bi bi-bell fs-6"></i>
                  {unreadCount > 0 && (
                    <span
                      className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                      style={{ fontSize: "0.65rem", padding: "3px 6px" }}
                    >
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Menu */}
                {showNotifDropdown && (
                  <div
                    className="position-absolute end-0 mt-2 dev-card p-0 shadow-lg"
                    style={{ width: "320px", zIndex: 1050 }}
                  >
                    <div className="d-flex justify-content-between align-items-center p-3 border-bottom" style={{ borderColor: "var(--dn-border)" }}>
                      <span className="fw-bold fs-6">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="btn btn-sm btn-link text-decoration-none p-0"
                          style={{ fontSize: "0.75rem" }}
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                      {notifications.length === 0 ? (
                        <div className="text-center py-4 text-muted small">
                          <i className="bi bi-bell-slash d-block fs-4 mb-2"></i>
                          No notifications yet
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className={`p-3 border-bottom d-flex align-items-start gap-2 ${
                              !notif.is_read ? "bg-primary-subtle" : ""
                            }`}
                            style={{ borderColor: "var(--dn-border)", cursor: "pointer" }}
                            onClick={() => {
                              if (!notif.is_read) handleMarkAsRead(notif.id, { stopPropagation: () => {} });
                            }}
                          >
                            <div className="mt-1">
                              <i className={`bi ${notif.type === "like" ? "bi-heart-fill text-danger" : notif.type === "comment" ? "bi-chat-dots-fill text-info" : "bi-person-plus-fill text-primary"}`}></i>
                            </div>
                            <div className="flex-grow-1">
                              <p className="mb-1 small">{notif.message}</p>
                              <span className="text-muted" style={{ fontSize: "0.68rem" }}>
                                {new Date(notif.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            {!notif.is_read && (
                              <button
                                onClick={(e) => handleMarkAsRead(notif.id, e)}
                                className="btn btn-sm text-muted p-0"
                                title="Mark read"
                              >
                                <i className="bi bi-check-circle"></i>
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                    <div className="p-2 text-center border-top" style={{ borderColor: "var(--dn-border)" }}>
                      <Link
                        to="/dashboard/notifications"
                        className="small text-decoration-none fw-medium"
                        onClick={() => setShowNotifDropdown(false)}
                      >
                        View all in Dashboard &rarr;
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Profile Dropdown or Login/Register */}
            {isAuthenticated ? (
              <div className="position-relative">
                <button
                  onClick={() => {
                    setShowUserDropdown(!showUserDropdown);
                    setShowNotifDropdown(false);
                  }}
                  className="btn p-0 border-0 d-flex align-items-center gap-2"
                >
                  <img
                    src={user?.profile_image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"}
                    alt={user?.username}
                    className="rounded-circle border"
                    style={{ width: "38px", height: "38px", objectFit: "cover", borderColor: "var(--dn-border)" }}
                  />
                </button>

                {showUserDropdown && (
                  <div
                    className="position-absolute end-0 mt-2 dev-card p-2 shadow-lg"
                    style={{ width: "230px", zIndex: 1050 }}
                  >
                    <div className="px-3 py-2 border-bottom" style={{ borderColor: "var(--dn-border)" }}>
                      <div className="fw-bold text-truncate">{user?.first_name} {user?.last_name}</div>
                      <div className="small text-muted text-truncate">@{user?.username}</div>
                      <span className="badge badge-tech mt-1">{user?.role}</span>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/dashboard"
                        className="dropdown-item py-2 px-3 rounded text-body d-flex align-items-center gap-2"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        <i className="bi bi-speedometer2 text-primary"></i> Dashboard
                      </Link>
                      <Link
                        to={`/profile/${user?.username}`}
                        className="dropdown-item py-2 px-3 rounded text-body d-flex align-items-center gap-2"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        <i className="bi bi-person text-info"></i> Public Profile
                      </Link>
                      <Link
                        to="/dashboard/blogs"
                        className="dropdown-item py-2 px-3 rounded text-body d-flex align-items-center gap-2"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        <i className="bi bi-journal-text text-success"></i> My Articles
                      </Link>
                      <Link
                        to="/dashboard/bookmarks"
                        className="dropdown-item py-2 px-3 rounded text-body d-flex align-items-center gap-2"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        <i className="bi bi-bookmark text-warning"></i> Bookmarks
                      </Link>
                      <Link
                        to="/dashboard/settings"
                        className="dropdown-item py-2 px-3 rounded text-body d-flex align-items-center gap-2"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        <i className="bi bi-gear text-secondary"></i> Settings
                      </Link>

                      {isAdmin && (
                        <>
                          <hr className="my-1" style={{ borderColor: "var(--dn-border)" }} />
                          <Link
                            to="/admin"
                            className="dropdown-item py-2 px-3 rounded text-danger fw-semibold d-flex align-items-center gap-2"
                            onClick={() => setShowUserDropdown(false)}
                          >
                            <i className="bi bi-shield-lock-fill"></i> Admin Console
                          </Link>
                        </>
                      )}

                      <hr className="my-1" style={{ borderColor: "var(--dn-border)" }} />
                      <button
                        onClick={() => {
                          logout();
                          setShowUserDropdown(false);
                          navigate("/");
                        }}
                        className="dropdown-item py-2 px-3 rounded text-danger d-flex align-items-center gap-2 w-100 text-start bg-transparent border-0"
                      >
                        <i className="bi bi-box-arrow-right"></i> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Link to="/login" className="btn btn-outline-dev py-1 px-3 fs-6">
                  Log In
                </Link>
                <Link to="/register" className="btn btn-primary-gradient py-1 px-3 fs-6">
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="btn btn-outline-dev d-lg-none p-2"
              style={{ width: "38px", height: "38px", borderRadius: "10px" }}
            >
              <i className={`bi ${mobileMenuOpen ? "bi-x-lg" : "bi-list"} fs-5`}></i>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="d-lg-none pt-3 pb-2 border-top mt-2" style={{ borderColor: "var(--dn-border)" }}>
            <form onSubmit={handleSearchSubmit} className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
            <div className="d-flex flex-column gap-2">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="text-body text-decoration-none py-1">
                Home
              </Link>
              <Link to="/explore" onClick={() => setMobileMenuOpen(false)} className="text-body text-decoration-none py-1">
                Explore Articles
              </Link>
              <Link to="/category/fastapi" onClick={() => setMobileMenuOpen(false)} className="text-body text-decoration-none py-1">
                Categories
              </Link>
              {isAuthenticated && (
                <>
                  <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="text-body text-decoration-none py-1">
                    Dashboard
                  </Link>
                  <Link to="/dashboard/blog/create" onClick={() => setMobileMenuOpen(false)} className="text-primary text-decoration-none py-1 fw-bold">
                    + Write Article
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
