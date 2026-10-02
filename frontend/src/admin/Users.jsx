import React, { useState, useEffect } from "react";
import { adminApi } from "../services/adminApi";
import { formatDate } from "../utils/helpers";
import { Pagination } from "../components/Pagination";

export const Users = () => {
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, [roleFilter, page]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getUsers({
        search: search || undefined,
        role: roleFilter || undefined,
        page,
        limit: 10,
      });
      setUsers(res.items || []);
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
    loadUsers();
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const updated = await adminApi.updateUserRole(userId, newRole);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: updated.role } : u)));
    } catch (err) {
      alert("Failed to update user role.");
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      const updated = await adminApi.updateUserStatus(userId, !currentStatus);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, is_active: updated.is_active } : u)));
    } catch (err) {
      alert("Failed to update user active status.");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user? This will remove all their blogs, comments, and profile.")) return;
    try {
      await adminApi.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      alert("Failed to delete user.");
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="fw-bold mb-1">User Management</h2>
        <span className="text-muted small">Manage accounts, assign permissions, and oversee platform access</span>
      </div>

      {/* Search and Filter */}
      <div className="dev-card p-3 mb-4">
        <form onSubmit={handleSearchSubmit} className="row g-2 align-items-center">
          <div className="col-12 col-md-6">
            <input
              type="text"
              className="form-control form-control-sm bg-transparent"
              placeholder="Search by name, username, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ borderColor: "var(--dn-border)" }}
            />
          </div>
          <div className="col-6 col-md-3">
            <select
              className="form-select form-select-sm bg-transparent"
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              style={{ borderColor: "var(--dn-border)" }}
            >
              <option value="">All Roles</option>
              <option value="ADMIN" className="text-dark">ADMIN</option>
              <option value="AUTHOR" className="text-dark">AUTHOR</option>
              <option value="USER" className="text-dark">USER</option>
            </select>
          </div>
          <div className="col-6 col-md-3">
            <button type="submit" className="btn btn-primary-gradient btn-sm w-100">
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Users Table */}
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
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <img
                          src={u.profile_image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"}
                          alt=""
                          className="rounded-circle border"
                          style={{ width: "34px", height: "34px", objectFit: "cover" }}
                        />
                        <div>
                          <div className="fw-semibold small">{u.first_name} {u.last_name}</div>
                          <div className="text-muted" style={{ fontSize: "0.7rem" }}>@{u.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="small">{u.email}</td>
                    <td>
                      <select
                        className="form-select form-select-sm bg-transparent py-0"
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        style={{ fontSize: "0.75rem", width: "105px", borderColor: "var(--dn-border)" }}
                      >
                        <option value="USER" className="text-dark">USER</option>
                        <option value="AUTHOR" className="text-dark">AUTHOR</option>
                        <option value="ADMIN" className="text-dark">ADMIN</option>
                      </select>
                    </td>
                    <td>
                      <span className={`badge ${u.is_active ? "bg-success" : "bg-danger"}`}>
                        {u.is_active ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="small text-muted">{formatDate(u.created_at)}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <button
                          onClick={() => handleToggleStatus(u.id, u.is_active)}
                          className={`btn btn-sm py-0 px-2 ${u.is_active ? "btn-outline-warning" : "btn-outline-success"}`}
                          title={u.is_active ? "Deactivate User" : "Activate User"}
                          style={{ fontSize: "0.75rem" }}
                        >
                          {u.is_active ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="btn btn-outline-danger btn-sm py-0 px-2"
                          title="Delete User"
                          style={{ fontSize: "0.75rem" }}
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
