import api from "./api";

export const authApi = {
  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  },

  resetPassword: async (token, new_password) => {
    const response = await api.post("/auth/reset-password", { token, new_password });
    return response.data;
  },

  getGoogleAuthUrl: async (redirectUri) => {
    const response = await api.get(`/auth/google/url?redirect_uri=${encodeURIComponent(redirectUri)}`);
    return response.data;
  },

  googleCallback: async (code, redirectUri) => {
    const response = await api.post("/auth/google/callback", { code, redirect_uri: redirectUri });
    return response.data;
  },

  getGithubAuthUrl: async (redirectUri) => {
    const response = await api.get(`/auth/github/url?redirect_uri=${encodeURIComponent(redirectUri)}`);
    return response.data;
  },

  githubCallback: async (code, redirectUri) => {
    const response = await api.post("/auth/github/callback", { code, redirect_uri: redirectUri });
    return response.data;
  },
};
