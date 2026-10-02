import React, { useState } from "react";
import { Link } from "react-router-dom";
import { formatDate, formatCount } from "../utils/helpers";
import { blogApi } from "../services/blogApi";
import { useAuth } from "../context/AuthContext";

export const BlogCard = ({ blog, onLikeChange, onBookmarkChange }) => {
  const { isAuthenticated } = useAuth();
  const [isLiked, setIsLiked] = useState(blog.is_liked || false);
  const [likesCount, setLikesCount] = useState(blog.likes_count || 0);
  const [isBookmarked, setIsBookmarked] = useState(blog.is_bookmarked || false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      alert("Please log in to like articles.");
      return;
    }
    if (likeLoading) return;
    setLikeLoading(true);
    try {
      const res = await blogApi.toggleLike(blog.id);
      setIsLiked(res.is_liked);
      setLikesCount(res.likes_count);
      if (onLikeChange) onLikeChange(blog.id, res);
    } catch (err) {
      console.error(err);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      alert("Please log in to bookmark articles.");
      return;
    }
    if (bookmarkLoading) return;
    setBookmarkLoading(true);
    try {
      const res = await blogApi.toggleBookmark(blog.id);
      setIsBookmarked(res.is_bookmarked);
      if (onBookmarkChange) onBookmarkChange(blog.id, res);
    } catch (err) {
      console.error(err);
    } finally {
      setBookmarkLoading(false);
    }
  };

  return (
    <div className="col-12 col-md-6 col-lg-4 mb-4">
      <div className="dev-card h-100 d-flex flex-column position-relative">
        {/* Cover Image */}
        <Link to={`/blog/${blog.slug}`} className="d-block overflow-hidden position-relative" style={{ height: "200px" }}>
          <img
            src={blog.cover_image || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80"}
            alt={blog.title}
            className="w-100 h-100 object-fit-cover"
            loading="lazy"
            style={{ transition: "transform 0.4s ease" }}
            onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
          />
          {blog.category && (
            <span
              className="position-absolute top-0 start-0 m-3 badge badge-tech shadow-sm"
              style={{ backdropFilter: "blur(8px)" }}
            >
              {blog.category.name}
            </span>
          )}
        </Link>

        {/* Card Body */}
        <div className="p-4 d-flex flex-column flex-grow-1">
          {/* Metadata row */}
          <div className="d-flex align-items-center justify-content-between mb-2 text-muted small">
            <span className="d-flex align-items-center gap-1">
              <i className="bi bi-clock"></i>
              {blog.reading_time || 1} min read
            </span>
            <span className="d-flex align-items-center gap-1">
              <i className="bi bi-eye"></i>
              {formatCount(blog.views)}
            </span>
          </div>

          {/* Title */}
          <h5 className="card-title fw-bold mb-2 line-clamp-2">
            <Link to={`/blog/${blog.slug}`} className="text-body text-decoration-none hover-primary">
              {blog.title}
            </Link>
          </h5>

          {/* Excerpt */}
          <p className="card-text text-muted small mb-4 flex-grow-1" style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {blog.excerpt || blog.content.substring(0, 120) + "..."}
          </p>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="d-flex flex-wrap gap-1 mb-3">
              {blog.tags.slice(0, 3).map((tag) => (
                <Link key={tag.id} to={`/explore?tag=${tag.slug}`} className="badge-tag text-decoration-none">
                  #{tag.name}
                </Link>
              ))}
            </div>
          )}

          {/* Author Footer & Actions */}
          <div className="pt-3 mt-auto border-top d-flex align-items-center justify-content-between" style={{ borderColor: "var(--dn-border)" }}>
            <Link to={`/profile/${blog.author?.username}`} className="d-flex align-items-center gap-2 text-decoration-none text-body">
              <img
                src={blog.author?.profile_image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"}
                alt={blog.author?.username}
                className="rounded-circle border"
                style={{ width: "32px", height: "32px", objectFit: "cover", borderColor: "var(--dn-border)" }}
              />
              <div className="d-flex flex-column" style={{ lineHeight: 1.2 }}>
                <span className="fw-semibold small text-truncate" style={{ maxWidth: "120px" }}>
                  {blog.author?.first_name} {blog.author?.last_name}
                </span>
                <span className="text-muted" style={{ fontSize: "0.7rem" }}>
                  {formatDate(blog.published_at || blog.created_at)}
                </span>
              </div>
            </Link>

            {/* Like & Bookmark icons */}
            <div className="d-flex align-items-center gap-2">
              <button
                onClick={handleLike}
                className={`btn btn-sm p-1 border-0 d-flex align-items-center gap-1 ${isLiked ? "text-danger" : "text-muted"}`}
                title={isLiked ? "Unlike" : "Like"}
              >
                <i className={`bi ${isLiked ? "bi-heart-fill" : "bi-heart"}`}></i>
                <span className="small">{likesCount}</span>
              </button>

              <button
                onClick={handleBookmark}
                className={`btn btn-sm p-1 border-0 ${isBookmarked ? "text-warning" : "text-muted"}`}
                title={isBookmarked ? "Remove Bookmark" : "Save Bookmark"}
              >
                <i className={`bi ${isBookmarked ? "bi-bookmark-fill" : "bi-bookmark"}`}></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
