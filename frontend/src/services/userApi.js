import api from "./api";

export const userApi = {
  getPopularAuthors: async (limit = 6) => {
    const response = await api.get(`/users/popular?limit=${limit}`);
    return response.data;
  },

  getUserProfile: async (username) => {
    const response = await api.get(`/users/${username}`);
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put("/users/profile", profileData);
    return response.data;
  },

  toggleFollow: async (userId) => {
    const response = await api.post(`/users/${userId}/follow`);
    return response.data;
  },

  getFollowers: async (userId) => {
    const response = await api.get(`/users/${userId}/followers`);
    return response.data;
  },

  getFollowing: async (userId) => {
    const response = await api.get(`/users/${userId}/following`);
    return response.data;
  },

  getNotifications: async (limit = 20) => {
    const response = await api.get(`/notifications?limit=${limit}`);
    return response.data;
  },

  markNotificationRead: async (notifId) => {
    const response = await api.patch(`/notifications/${notifId}/read`);
    return response.data;
  },

  markAllNotificationsRead: async () => {
    const response = await api.patch("/notifications/read-all");
    return response.data;
  },

  getAuthorAnalytics: async () => {
    const response = await api.get("/blogs/user/analytics");
    return response.data;
  },
};
