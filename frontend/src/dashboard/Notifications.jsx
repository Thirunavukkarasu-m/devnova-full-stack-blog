import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { userApi } from "../services/userApi";
import { formatDate } from "../utils/helpers";

export const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await userApi.getNotifications(50);
      setNotifications(res.items || []);
      setUnreadCount(res.unread_count || 0);
      document.title = "Notifications — DevNova";
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
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
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 className="fw-bold mb-1">Notifications</h2>
          <span className="text-muted small">Stay updated on reactions, discussions, and followers</span>
        </div>

        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="btn btn-outline-dev btn-sm">
            <i className="bi bi-check2-all me-1"></i> Mark All as Read
          </button>
        )}
      </div>

      <div className="dev-card p-0 overflow-hidden">
        {loading ? (
          <div className="p-5 text-center">
            <div className="spinner-border text-primary" role="status"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-5 text-center text-muted">
            <i className="bi bi-bell-slash fs-1 text-dim d-block mb-3"></i>
            <p>You have no notifications at this time.</p>
          </div>
        ) : (
          <div className="list-group list-group-flush">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`list-group-item p-3 d-flex align-items-start gap-3 bg-transparent border-bottom ${
                  !n.is_read ? "bg-primary-subtle" : ""
                }`}
                style={{ borderColor: "var(--dn-border)" }}
              >
                <div className="mt-1">
                  <i
                    className={`bi ${
                      n.type === "like"
                        ? "bi-heart-fill text-danger fs-5"
                        : n.type === "comment" || n.type === "reply"
                        ? "bi-chat-dots-fill text-info fs-5"
                        : "bi-person-plus-fill text-primary fs-5"
                    }`}
                  ></i>
                </div>

                <div className="flex-grow-1">
                  <div className="d-flex align-items-center justify-content-between">
                    <p className="mb-1 text-body">{n.message}</p>
                    <span className="text-muted small">{formatDate(n.created_at)}</span>
                  </div>
                  {n.actor && (
                    <Link to={`/profile/${n.actor.username}`} className="small text-muted text-decoration-none hover-primary">
                      @{n.actor.username}
                    </Link>
                  )}
                </div>

                {!n.is_read && (
                  <button
                    onClick={() => handleMarkRead(n.id)}
                    className="btn btn-outline-dev btn-sm py-1 px-2"
                    title="Mark as read"
                  >
                    <i className="bi bi-check"></i>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
