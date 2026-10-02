import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { userApi } from "../services/userApi";
import { blogApi } from "../services/blogApi";
import { useAuth } from "../context/AuthContext";
import { formatDate, formatCount } from "../utils/helpers";
import { BlogList } from "../components/BlogList";

export const Profile = () => {
  const { username } = useParams();
  const { user: currentUser, isAuthenticated } = useAuth();

  const [profileUser, setProfileUser] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [username]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const userData = await userApi.getUserProfile(username);
      setProfileUser(userData);
      setIsFollowing(userData.is_following || false);
      setFollowersCount(userData.followers_count || 0);

      // Load published blogs by this author
      const blogsData = await blogApi.getBlogs({ author: username, limit: 12 });
      setBlogs(blogsData.items || []);
      document.title = `${userData.first_name} ${userData.last_name} (@${userData.username}) — DevNova`;
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFollow = async () => {
    if (!isAuthenticated) {
      alert("Please log in to follow authors.");
      return;
    }
    try {
      const res = await userApi.toggleFollow(profileUser.id);
      setIsFollowing(res.is_following);
      setFollowersCount(res.followers_count);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary my-5" role="status"></div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="container py-5 text-center">
        <h4>User not found</h4>
        <Link to="/" className="btn btn-primary-gradient mt-3">Back to Home</Link>
      </div>
    );
  }

  const isMe = currentUser && currentUser.id === profileUser.id;

  return (
    <div className="container px-4 px-lg-5 py-5">
      {/* Profile Header Card */}
      <div className="dev-card p-4 p-md-5 mb-5 shadow-sm">
        <div className="d-flex flex-column flex-md-row align-items-center align-items-md-start gap-4">
          <img
            src={profileUser.profile_image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"}
            alt={profileUser.username}
            className="rounded-circle border shadow-sm"
            style={{ width: "110px", height: "110px", objectFit: "cover", borderColor: "var(--dn-border)" }}
          />

          <div className="flex-grow-1 text-center text-md-start">
            <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-3 mb-2">
              <div>
                <h2 className="fw-bold mb-0">{profileUser.first_name} {profileUser.last_name}</h2>
                <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-2 mt-1">
                  <span className="text-muted small">@{profileUser.username}</span>
                  <span className="badge badge-tech">{profileUser.role}</span>
                </div>
              </div>

              {isMe ? (
                <Link to="/dashboard/settings" className="btn btn-outline-dev btn-sm">
                  <i className="bi bi-pencil me-1"></i> Edit Profile
                </Link>
              ) : (
                <button
                  onClick={handleToggleFollow}
                  className={`btn btn-sm ${isFollowing ? "btn-outline-dev" : "btn-primary-gradient"} px-4`}
                >
                  {isFollowing ? "Following" : "+ Follow"}
                </button>
              )}
            </div>

            {/* Bio */}
            <p className="text-muted my-3" style={{ maxWidth: "640px" }}>
              {profileUser.profile?.bio || "No biography provided yet."}
            </p>

            {/* Social Links & Location */}
            <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-md-start gap-3 small text-muted mb-4">
              {profileUser.profile?.location && (
                <span className="d-flex align-items-center gap-1">
                  <i className="bi bi-geo-alt"></i> {profileUser.profile.location}
                </span>
              )}
              {profileUser.profile?.website && (
                <a href={profileUser.profile.website} target="_blank" rel="noreferrer" className="text-muted text-decoration-none hover-primary d-flex align-items-center gap-1">
                  <i className="bi bi-link-45deg"></i> Website
                </a>
              )}
              {profileUser.profile?.github_profile && (
                <a href={profileUser.profile.github_profile} target="_blank" rel="noreferrer" className="text-muted text-decoration-none hover-primary d-flex align-items-center gap-1">
                  <i className="bi bi-github"></i> GitHub
                </a>
              )}
              {profileUser.profile?.linkedin_profile && (
                <a href={profileUser.profile.linkedin_profile} target="_blank" rel="noreferrer" className="text-muted text-decoration-none hover-primary d-flex align-items-center gap-1">
                  <i className="bi bi-linkedin"></i> LinkedIn
                </a>
              )}
              <span className="d-flex align-items-center gap-1">
                <i className="bi bi-calendar3"></i> Joined {formatDate(profileUser.created_at)}
              </span>
            </div>

            {/* Stats Row */}
            <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-4 pt-3 border-top" style={{ borderColor: "var(--dn-border)" }}>
              <div>
                <span className="fw-bold fs-5 text-body">{profileUser.blogs_count || 0}</span>
                <span className="text-muted small ms-1">Articles</span>
              </div>
              <div>
                <span className="fw-bold fs-5 text-body">{formatCount(followersCount)}</span>
                <span className="text-muted small ms-1">Followers</span>
              </div>
              <div>
                <span className="fw-bold fs-5 text-body">{formatCount(profileUser.following_count || 0)}</span>
                <span className="text-muted small ms-1">Following</span>
              </div>
              <div>
                <span className="fw-bold fs-5 text-body">{formatCount(profileUser.total_likes_received || 0)}</span>
                <span className="text-muted small ms-1">Likes</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Author's Published Articles */}
      <h4 className="fw-bold mb-4">Articles by {profileUser.first_name}</h4>
      <BlogList
        blogs={blogs}
        emptyMessage={`${profileUser.first_name} has not published any public articles yet.`}
      />
    </div>
  );
};
