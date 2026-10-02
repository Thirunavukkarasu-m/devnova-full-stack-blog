import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { blogApi } from "../services/blogApi";
import { userApi } from "../services/userApi";
import { useAuth } from "../context/AuthContext";
import { formatDate, formatCount } from "../utils/helpers";
import { CommentSection } from "../components/CommentSection";
import { BlogCard } from "../components/BlogCard";

export const BlogDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [blog, setBlog] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadArticle();
  }, [slug]);

  const loadArticle = async () => {
    try {
      setLoading(true);
      const data = await blogApi.getBlogBySlug(slug);
      setBlog(data);
      setIsLiked(data.is_liked || false);
      setLikesCount(data.likes_count || 0);
      setIsBookmarked(data.is_bookmarked || false);

      // Record view count
      blogApi.recordView(slug);

      // Check author follow status if logged in
      if (data.author && isAuthenticated) {
        try {
          const authorProfile = await userApi.getUserProfile(data.author.username);
          setIsFollowing(authorProfile.is_following || false);
        } catch {
          // ignore
        }
      }

      // Load related blogs
      const relatedData = await blogApi.getRelatedBlogs(slug);
      setRelated(relatedData || []);

      document.title = `${data.title} — DevNova`;
    } catch (err) {
      console.error("Failed to fetch article:", err);
      navigate("/404");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLike = async () => {
    if (!isAuthenticated) {
      alert("Please log in to like articles.");
      return;
    }
    try {
      const res = await blogApi.toggleLike(blog.id);
      setIsLiked(res.is_liked);
      setLikesCount(res.likes_count);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleBookmark = async () => {
    if (!isAuthenticated) {
      alert("Please log in to bookmark articles.");
      return;
    }
    try {
      const res = await blogApi.toggleBookmark(blog.id);
      setIsBookmarked(res.is_bookmarked);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleFollow = async () => {
    if (!isAuthenticated) {
      alert("Please log in to follow authors.");
      return;
    }
    try {
      const res = await userApi.toggleFollow(blog.author.id);
      setIsFollowing(res.is_following);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareUrl = encodeURIComponent(window.location.href);
  const shareTitle = encodeURIComponent(blog?.title || "DevNova Article");

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary my-5" role="status">
          <span className="visually-hidden">Loading article...</span>
        </div>
      </div>
    );
  }

  if (!blog) return null;

  return (
    <article className="blog-details-page pb-5">
      {/* Top Banner / Hero */}
      <header className="py-4 border-bottom" style={{ borderColor: "var(--dn-border)", backgroundColor: "var(--dn-surface)" }}>
        <div className="container px-4 px-lg-5" style={{ maxWidth: "860px" }}>
          {/* Category & Stats Pill */}
          <div className="d-flex align-items-center gap-2 mb-3">
            {blog.category && (
              <Link to={`/category/${blog.category.slug}`} className="badge badge-tech text-decoration-none">
                {blog.category.name}
              </Link>
            )}
            <span className="text-muted small">&bull;</span>
            <span className="text-muted small">{blog.reading_time || 1} min read</span>
            <span className="text-muted small">&bull;</span>
            <span className="text-muted small d-flex align-items-center gap-1">
              <i className="bi bi-eye"></i> {formatCount(blog.views)} views
            </span>
          </div>

          {/* Article Title */}
          <h1 className="display-5 fw-extrabold mb-3" style={{ letterSpacing: "-0.03em" }}>
            {blog.title}
          </h1>

          {/* Subtitle / Excerpt */}
          {blog.excerpt && (
            <p className="lead text-muted mb-4" style={{ fontSize: "1.15rem" }}>
              {blog.excerpt}
            </p>
          )}

          {/* Author Meta Box */}
          <div className="d-flex align-items-center justify-content-between pt-3 border-top" style={{ borderColor: "var(--dn-border)" }}>
            <div className="d-flex align-items-center gap-3">
              <Link to={`/profile/${blog.author.username}`}>
                <img
                  src={blog.author.profile_image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"}
                  alt={blog.author.username}
                  className="rounded-circle border"
                  style={{ width: "48px", height: "48px", objectFit: "cover", borderColor: "var(--dn-border)" }}
                />
              </Link>
              <div>
                <div className="d-flex align-items-center gap-2">
                  <Link to={`/profile/${blog.author.username}`} className="fw-bold text-body text-decoration-none hover-primary">
                    {blog.author.first_name} {blog.author.last_name}
                  </Link>
                  {user && user.id !== blog.author.id && (
                    <button
                      onClick={handleToggleFollow}
                      className={`btn btn-sm py-0 px-2 rounded-pill ${isFollowing ? "btn-outline-dev" : "btn-primary-gradient"}`}
                      style={{ fontSize: "0.75rem" }}
                    >
                      {isFollowing ? "Following" : "+ Follow"}
                    </button>
                  )}
                </div>
                <div className="text-muted small">
                  Published on {formatDate(blog.published_at || blog.created_at)}
                </div>
              </div>
            </div>

            {/* Like & Bookmark Quick Actions */}
            <div className="d-flex align-items-center gap-2">
              <button
                onClick={handleToggleLike}
                className={`btn btn-sm d-flex align-items-center gap-1 ${isLiked ? "btn-danger text-white" : "btn-outline-dev"}`}
              >
                <i className={`bi ${isLiked ? "bi-heart-fill" : "bi-heart"}`}></i>
                <span>{likesCount}</span>
              </button>
              <button
                onClick={handleToggleBookmark}
                className={`btn btn-sm ${isBookmarked ? "btn-warning text-dark" : "btn-outline-dev"}`}
                title={isBookmarked ? "Saved" : "Save Bookmark"}
              >
                <i className={`bi ${isBookmarked ? "bi-bookmark-fill" : "bi-bookmark"}`}></i>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <div className="container px-4 px-lg-5 py-4" style={{ maxWidth: "860px" }}>
        {/* Cover Image */}
        {blog.cover_image && (
          <div className="mb-5 rounded-4 overflow-hidden shadow-lg border" style={{ borderColor: "var(--dn-border)", maxHeight: "450px" }}>
            <img
              src={blog.cover_image}
              alt={blog.title}
              className="w-100 h-100 object-fit-cover"
            />
          </div>
        )}

        {/* Article Body */}
        <div className="article-content fs-5" style={{ lineHeight: "1.8", color: "var(--dn-text-main)" }}>
          {blog.content.split("\n\n").map((paragraph, index) => {
            if (paragraph.startsWith("## ")) {
              return <h2 key={index} className="fw-bold mt-5 mb-3">{paragraph.replace("## ", "")}</h2>;
            }
            if (paragraph.startsWith("### ")) {
              return <h3 key={index} className="fw-bold mt-4 mb-2">{paragraph.replace("### ", "")}</h3>;
            }
            if (paragraph.startsWith("```")) {
              const lines = paragraph.split("\n");
              const code = lines.slice(1, -1).join("\n");
              return (
                <div key={index} className="my-4 position-relative">
                  <pre>
                    <code>{code}</code>
                  </pre>
                </div>
              );
            }
            if (paragraph.startsWith("- ")) {
              const items = paragraph.split("\n");
              return (
                <ul key={index} className="mb-4">
                  {items.map((it, idx) => (
                    <li key={idx} className="mb-1">{it.replace("- ", "")}</li>
                  ))}
                </ul>
              );
            }
            return <p key={index} className="mb-4">{paragraph}</p>;
          })}
        </div>

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="my-5 pt-3 border-top d-flex align-items-center flex-wrap gap-2" style={{ borderColor: "var(--dn-border)" }}>
            <span className="small text-muted me-2">Tags:</span>
            {blog.tags.map((t) => (
              <Link key={t.id} to={`/explore?tag=${t.slug}`} className="badge badge-tag text-decoration-none">
                #{t.name}
              </Link>
            ))}
          </div>
        )}

        {/* Social Share Bar */}
        <div className="dev-card p-4 my-5 d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <h6 className="fw-bold mb-1">Share this article</h6>
            <span className="text-muted small">Share knowledge with fellow engineers</span>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button onClick={handleCopyLink} className="btn btn-outline-dev btn-sm position-relative d-flex align-items-center gap-1">
              <i className="bi bi-link-45deg fs-6"></i>
              <span>{copied ? "Link Copied!" : "Copy Link"}</span>
            </button>
            <a
              href={`https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrl}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline-dev btn-sm"
              title="Share on X"
            >
              <i className="bi bi-twitter-x"></i>
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline-dev btn-sm"
              title="Share on LinkedIn"
            >
              <i className="bi bi-linkedin"></i>
            </a>
            <a
              href={`https://api.whatsapp.com/send?text=${shareTitle}%20${shareUrl}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline-dev btn-sm"
              title="Share on WhatsApp"
            >
              <i className="bi bi-whatsapp"></i>
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline-dev btn-sm"
              title="Share on Facebook"
            >
              <i className="bi bi-facebook"></i>
            </a>
          </div>
        </div>

        {/* Author Detailed Card */}
        <div className="dev-card p-4 p-md-5 my-5">
          <div className="d-flex flex-column flex-sm-row align-items-center align-items-sm-start gap-4 text-center text-sm-start">
            <Link to={`/profile/${blog.author.username}`}>
              <img
                src={blog.author.profile_image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"}
                alt={blog.author.username}
                className="rounded-circle border"
                style={{ width: "80px", height: "80px", objectFit: "cover", borderColor: "var(--dn-border)" }}
              />
            </Link>
            <div className="flex-grow-1">
              <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-sm-between gap-2 mb-2">
                <div>
                  <h5 className="fw-bold mb-0">
                    <Link to={`/profile/${blog.author.username}`} className="text-body text-decoration-none hover-primary">
                      {blog.author.first_name} {blog.author.last_name}
                    </Link>
                  </h5>
                  <span className="text-muted small">@{blog.author.username} &bull; {blog.author.role}</span>
                </div>
                {user && user.id !== blog.author.id && (
                  <button
                    onClick={handleToggleFollow}
                    className={`btn btn-sm ${isFollowing ? "btn-outline-dev" : "btn-primary-gradient"}`}
                  >
                    {isFollowing ? "Following" : "+ Follow Author"}
                  </button>
                )}
              </div>
              <p className="text-muted small mb-0">
                Staff contributor and software engineer. Writing technical articles and sharing learnings with the DevNova developer ecosystem.
              </p>
            </div>
          </div>
        </div>

        {/* Discussion / Comments Section */}
        <CommentSection blogId={blog.id} />

        {/* Related Articles Section */}
        {related.length > 0 && (
          <div className="mt-5 pt-4 border-top" style={{ borderColor: "var(--dn-border)" }}>
            <h4 className="fw-bold mb-4">Related Engineering Insights</h4>
            <div className="row">
              {related.map((rel) => (
                <BlogCard key={rel.id} blog={rel} />
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
};
