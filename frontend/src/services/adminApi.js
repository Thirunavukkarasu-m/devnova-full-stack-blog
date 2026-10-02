import api from "./api";

export const adminApi = {
  getAdminAnalytics: async () => {
    const response = await api.get("/admin/analytics");
    return response.data;
  },

  getUsers: async (params = {}) => {
    const response = await api.get("/admin/users", { params });
    return response.data;
  },

  updateUserRole: async (userId, role) => {
    const response = await api.patch(`/admin/users/${userId}/role`, { role });
    return response.data;
  },

  updateUserStatus: async (userId, isActive) => {
    const response = await api.patch(`/admin/users/${userId}/status`, { is_active: isActive });
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  getAdminBlogs: async (params = {}) => {
    const response = await api.get("/admin/blogs", { params });
    return response.data;
  },

  updateBlogStatus: async (blogId, status) => {
    const response = await api.patch(`/admin/blogs/${blogId}/status`, { new_status: status });
    return response.data;
  },

  deleteAdminBlog: async (blogId) => {
    const response = await api.delete(`/admin/blogs/${blogId}`);
    return response.data;
  },

  createCategory: async (categoryData) => {
    const response = await api.post("/categories", categoryData);
    return response.data;
  },

  updateCategory: async (categoryId, data) => {
    const response = await api.put(`/categories/${categoryId}`, data);
    return response.data;
  },

  deleteCategory: async (categoryId, force = false) => {
    const response = await api.delete(`/categories/${categoryId}?force=${force}`);
    return response.data;
  },

  getReports: async (params = {}) => {
    const response = await api.get("/admin/reports", { params });
    return response.data;
  },

  updateReportStatus: async (reportId, status) => {
    const response = await api.patch(`/admin/reports/${reportId}`, { status });
    return response.data;
  },
};
