import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminRoute } from "./components/AdminRoute";

// Public Pages
import { Home } from "./pages/Home";
import { Explore } from "./pages/Explore";
import { BlogDetails } from "./pages/BlogDetails";
import { Category } from "./pages/Category";
import { Search } from "./pages/Search";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { ForgotPassword } from "./pages/ForgotPassword";
import { ResetPassword } from "./pages/ResetPassword";
import { Profile } from "./pages/Profile";
import { Bookmarks } from "./pages/Bookmarks";
import { CreateBlog } from "./pages/CreateBlog";
import { EditBlog } from "./pages/EditBlog";
import { NotFound } from "./pages/NotFound";

// Dashboard Pages
import { DashboardLayout } from "./dashboard/DashboardLayout";
import { Dashboard } from "./dashboard/Dashboard";
import { MyBlogs } from "./dashboard/MyBlogs";
import { Analytics } from "./dashboard/Analytics";
import { Notifications } from "./dashboard/Notifications";
import { Settings } from "./dashboard/Settings";
import { ProfileSettings } from "./dashboard/ProfileSettings";

// Admin Pages
import { AdminLayout } from "./admin/AdminLayout";
import { AdminDashboard } from "./admin/AdminDashboard";
import { Users as AdminUsers } from "./admin/Users";
import { Blogs as AdminBlogs } from "./admin/Blogs";
import { Categories as AdminCategories } from "./admin/Categories";
import { Reports as AdminReports } from "./admin/Reports";
import { Analytics as AdminAnalytics } from "./admin/Analytics";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="d-flex flex-column min-vh-100">
            <Navbar />
            <main className="flex-grow-1 d-flex flex-column">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/blog/:slug" element={<BlogDetails />} />
                <Route path="/category/:slug" element={<Category />} />
                <Route path="/search" element={<Search />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/profile/:username" element={<Profile />} />

                {/* Authenticated Dashboard Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Dashboard />} />
                  <Route path="blogs" element={<MyBlogs />} />
                  <Route path="blog/create" element={<CreateBlog />} />
                  <Route path="blog/:id/edit" element={<EditBlog />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="bookmarks" element={<Bookmarks />} />
                  <Route path="notifications" element={<Notifications />} />
                  <Route path="profile" element={<ProfileSettings />} />
                  <Route path="settings" element={<Settings />} />
                </Route>

                {/* Authenticated Standalone Routes */}
                <Route
                  path="/dashboard/blog/create"
                  element={
                    <ProtectedRoute>
                      <CreateBlog />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/blog/:id/edit"
                  element={
                    <ProtectedRoute>
                      <EditBlog />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Console Routes */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminLayout />
                    </AdminRoute>
                  }
                >
                  <Route index element={<AdminDashboard />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="blogs" element={<AdminBlogs />} />
                  <Route path="categories" element={<AdminCategories />} />
                  <Route path="reports" element={<AdminReports />} />
                  <Route path="analytics" element={<AdminAnalytics />} />
                </Route>

                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
