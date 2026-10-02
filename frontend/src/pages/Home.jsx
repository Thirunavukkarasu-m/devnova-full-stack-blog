import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { blogApi } from "../services/blogApi";
import { userApi } from "../services/userApi";
import { BlogList } from "../components/BlogList";
import { BlogCard } from "../components/BlogCard";
import { formatCount } from "../utils/helpers";
import { useAuth } from "../context/AuthContext";

export const Home = () => {
  const { isAuthenticated } = useAuth();
  const [featuredBlogs, setFeaturedBlogs] = useState([]);
  const [latestBlogs, setLatestBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [popularAuthors, setPopularAuthors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      const [featRes, latestRes, catRes, authRes] = await Promise.all([
        blogApi.getBlogs({ sort_by: "views", limit: 3 }),
        blogApi.getBlogs({ sort_by: "latest", limit: 6 }),
        blogApi.getCategories(),
        userApi.getPopularAuthors(4),
      ]);

      setFeaturedBlogs(featRes.items || []);
      setLatestBlogs(latestRes.items || []);
      setCategories(catRes || []);
      setPopularAuthors(authRes || []);
    } catch (err) {
      console.error("Failed to load home page data:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page pb-5">
      {/* Hero Section */}
      <section className="position-relative py-5 overflow-hidden border-bottom" style={{ borderColor: "var(--dn-border)", background: "radial-gradient(ellipse at 50% -20%, rgba(56, 189, 248, 0.15), transparent 70%)" }}>
        <div className="container px-4 px-lg-5 py-5 text-center position-relative" style={{ zIndex: 1 }}>
          <div className="badge badge-tech mb-3 px-3 py-2 text-uppercase fw-bold" style={{ fontSize: "0.8rem", letterSpacing: "0.08em" }}>
            The Premier Developer Community
          </div>
          <h1 className="display-3 fw-extrabold mb-3" style={{ letterSpacing: "-0.04em" }}>
            Explore. Learn. <span className="text-gradient">Build.</span>
          </h1>
          <p className="lead text-muted mx-auto mb-4" style={{ maxWidth: "680px", fontSize: "1.2rem" }}>
            DevNova is a high-performance technology publishing platform where developers, architects, and innovators dive deep into production-grade engineering, cloud scale, and modern tech stacks.
          </p>

          <div className="d-flex flex-wrap justify-content-center gap-3">
            <Link to="/explore" className="btn btn-primary-gradient px-4 py-3 fs-6 d-flex align-items-center gap-2">
              <i className="bi bi-compass"></i>
              <span>Explore Articles</span>
            </Link>
            {isAuthenticated ? (
              <Link to="/dashboard/blog/create" className="btn btn-outline-dev px-4 py-3 fs-6 d-flex align-items-center gap-2">
                <i className="bi bi-pencil-square"></i>
                <span>Start Writing</span>
              </Link>
            ) : (
              <Link to="/register" className="btn btn-outline-dev px-4 py-3 fs-6 d-flex align-items-center gap-2">
                <i className="bi bi-person-plus"></i>
                <span>Join DevNova</span>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Featured Articles Section */}
      <section className="container px-4 px-lg-5 py-5">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h3 className="fw-bold mb-1">Featured Insights</h3>
            <p className="text-muted small mb-0">Highest impact technical deep-dives selected by the community</p>
          </div>
          <Link to="/explore?sort=views" className="text-decoration-none fw-semibold small text-primary d-flex align-items-center gap-1">
            <span>View Top Articles</span>
            <i className="bi bi-arrow-right"></i>
          </Link>
        </div>

        <BlogList blogs={featuredBlogs} loading={loading} />
      </section>

      {/* Explore by Category Carousel/Grid */}
      <section className="py-5" style={{ backgroundColor: "var(--dn-surface)" }}>
        <div className="container px-4 px-lg-5">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <h3 className="fw-bold mb-1">Explore Technologies</h3>
              <p className="text-muted small mb-0">Curated tracks across core engineering domains</p>
            </div>
            <Link to="/explore" className="text-decoration-none fw-semibold small text-primary d-flex align-items-center gap-1">
              <span>All Topics</span>
              <i className="bi bi-arrow-right"></i>
            </Link>
          </div>

          <div className="row g-3">
            {categories.map((cat) => (
              <div key={cat.id} className="col-6 col-md-4 col-lg-3">
                <Link to={`/category/${cat.slug}`} className="dev-card p-3 d-flex align-items-center gap-3 text-decoration-none text-body h-100">
                  <img
                    src={cat.image || "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=100&q=80"}
                    alt={cat.name}
                    className="rounded-3"
                    style={{ width: "48px", height: "48px", objectFit: "cover" }}
                  />
                  <div className="overflow-hidden">
                    <h6 className="fw-bold mb-0 text-truncate">{cat.name}</h6>
                    <span className="text-muted" style={{ fontSize: "0.75rem" }}>
                      {cat.article_count || 0} {cat.article_count === 1 ? "article" : "articles"}
                    </span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Technical Articles */}
      <section className="container px-4 px-lg-5 py-5">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h3 className="fw-bold mb-1">Latest Articles</h3>
            <p className="text-muted small mb-0">Fresh perspectives and implementations written by developers</p>
          </div>
          <Link to="/explore" className="text-decoration-none fw-semibold small text-primary d-flex align-items-center gap-1">
            <span>Browse All</span>
            <i className="bi bi-arrow-right"></i>
          </Link>
        </div>

        <BlogList blogs={latestBlogs} loading={loading} />
      </section>

      {/* Top Engineering Authors */}
      <section className="container px-4 px-lg-5 py-4">
        <div className="dev-card p-4 p-lg-5">
          <div className="text-center max-w-600 mx-auto mb-4">
            <h3 className="fw-bold mb-2">Featured Tech Authors</h3>
            <p className="text-muted small">Learn directly from staff engineers, database architects, and OSS maintainers.</p>
          </div>

          <div className="row g-4 justify-content-center">
            {popularAuthors.map((author) => (
              <div key={author.id} className="col-12 col-sm-6 col-md-3">
                <div className="dev-card p-4 text-center h-100 d-flex flex-column align-items-center">
                  <img
                    src={author.profile_image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"}
                    alt={author.username}
                    className="rounded-circle border mb-3"
                    style={{ width: "72px", height: "72px", objectFit: "cover", borderColor: "var(--dn-border)" }}
                  />
                  <h6 className="fw-bold mb-0 text-truncate w-100">
                    <Link to={`/profile/${author.username}`} className="text-body text-decoration-none hover-primary">
                      {author.first_name} {author.last_name}
                    </Link>
                  </h6>
                  <span className="text-muted small mb-2">@{author.username}</span>
                  <p className="small text-muted mb-3 flex-grow-1" style={{ fontSize: "0.8rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {author.profile?.bio || "DevNova platform contributor"}
                  </p>
                  <div className="d-flex gap-2 text-muted small mb-3">
                    <span><strong>{author.blogs_count || 0}</strong> blogs</span>
                    <span>&bull;</span>
                    <span><strong>{formatCount(author.followers_count || 0)}</strong> followers</span>
                  </div>
                  <Link to={`/profile/${author.username}`} className="btn btn-outline-dev btn-sm w-100 mt-auto">
                    View Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
