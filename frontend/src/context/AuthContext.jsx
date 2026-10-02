import React, { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../services/authApi";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("devnova_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("devnova_token") || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("devnova_token");
      if (storedToken) {
        try {
          const currentUser = await authApi.getCurrentUser();
          setUser(currentUser);
          localStorage.setItem("devnova_user", JSON.stringify(currentUser));
        } catch (error) {
          console.error("Session initialization failed:", error);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const setAuthData = (data) => {
    localStorage.setItem("devnova_token", data.access_token);
    if (data.refresh_token) {
      localStorage.setItem("devnova_refresh_token", data.refresh_token);
    }
    localStorage.setItem("devnova_user", JSON.stringify(data.user));
    setToken(data.access_token);
    setUser(data.user);
  };

  const login = async (credentials) => {
    const data = await authApi.login(credentials);
    setAuthData(data);
    return data.user;
  };

  const register = async (userData) => {
    const data = await authApi.register(userData);
    setAuthData(data);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("devnova_token");
    localStorage.removeItem("devnova_refresh_token");
    localStorage.removeItem("devnova_user");
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("devnova_user", JSON.stringify(updatedUser));
  };

  const refreshUser = async () => {
    try {
      const currentUser = await authApi.getCurrentUser();
      setUser(currentUser);
      localStorage.setItem("devnova_user", JSON.stringify(currentUser));
      return currentUser;
    } catch {
      return null;
    }
  };

  const isAdmin = user?.role === "ADMIN";
  const isAuthor = user?.role === "AUTHOR" || user?.role === "ADMIN";
  const isAuthenticated = !!user && !!token;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        isAuthor,
        login,
        register,
        logout,
        updateUser,
        refreshUser,
        setAuthData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
