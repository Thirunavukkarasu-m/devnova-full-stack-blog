import React from "react";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="mt-auto border-top py-5" style={{ backgroundColor: "var(--dn-surface)", borderColor: "var(--dn-border)" }}>
      <div className="container px-4 px-lg-5">
        <div className="row g-4 mb-5">
          {/* Brand Info */}
          <div className="col-12 col-md-4">
            <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none mb-3">
              <div
                className="d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  background: "linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)",
                }}
              >
                <i className="bi bi-code-slash fs-5"></i>
              </div>
              <span className="fs-4 fw-bold text-gradient">DevNova</span>
            </Link>
            <p className="text-muted small pe-lg-4 mb-3">
              Explore. Learn. Build. DevNova is the premier engineering hub for technology insights, modern full-stack architectures, and developer knowledge sharing.
            </p>
            <div className="d-flex gap-3">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="text-muted fs-5 hover-primary">
                <i className="bi bi-github"></i>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-muted fs-5 hover-primary">
                <i className="bi bi-twitter-x"></i>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-muted fs-5 hover-primary">
                <i className="bi bi-linkedin"></i>
              </a>
              <a href="https://discord.com" target="_blank" rel="noreferrer" className="text-muted fs-5 hover-primary">
                <i className="bi bi-discord"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-6 col-md-2">
            <h6 className="fw-bold mb-3 text-uppercase small" style={{ letterSpacing: "0.05em" }}>Platform</h6>
            <ul className="list-unstyled d-flex flex-column gap-2 small">
              <li><Link to="/" className="text-muted text-decoration-none hover-primary">Home</Link></li>
              <li><Link to="/explore" className="text-muted text-decoration-none hover-primary">Explore Blogs</Link></li>
              <li><Link to="/search" className="text-muted text-decoration-none hover-primary">Search</Link></li>
              <li><Link to="/dashboard/blog/create" className="text-muted text-decoration-none hover-primary">Write Article</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="col-6 col-md-3">
            <h6 className="fw-bold mb-3 text-uppercase small" style={{ letterSpacing: "0.05em" }}>Featured Tech</h6>
            <ul className="list-unstyled d-flex flex-column gap-2 small">
              <li><Link to="/category/fastapi" className="text-muted text-decoration-none hover-primary">FastAPI & Python</Link></li>
              <li><Link to="/category/react" className="text-muted text-decoration-none hover-primary">React & Modern UI</Link></li>
              <li><Link to="/category/postgresql" className="text-muted text-decoration-none hover-primary">PostgreSQL & Databases</Link></li>
              <li><Link to="/category/ai-machine-learning" className="text-muted text-decoration-none hover-primary">AI & Machine Learning</Link></li>
              <li><Link to="/category/devops-cloud" className="text-muted text-decoration-none hover-primary">DevOps & Cloud</Link></li>
            </ul>
          </div>

          {/* Newsletter Subscribe */}
          <div className="col-12 col-md-3">
            <h6 className="fw-bold mb-3 text-uppercase small" style={{ letterSpacing: "0.05em" }}>Engineering Dispatch</h6>
            <p className="text-muted small mb-3">Subscribe for weekly curated technical deep-dives and system architecture case studies.</p>
            <form onSubmit={(e) => { e.preventDefault(); alert("Thank you for subscribing to DevNova Engineering Dispatch!"); }} className="d-flex flex-column gap-2">
              <input
                type="email"
                required
                className="form-control form-control-sm bg-transparent"
                placeholder="developer@company.com"
                style={{ borderColor: "var(--dn-border)" }}
              />
              <button type="submit" className="btn btn-primary-gradient btn-sm">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center pt-4 border-top text-muted small" style={{ borderColor: "var(--dn-border)" }}>
          <p className="mb-2 mb-sm-0">&copy; {new Date().getFullYear()} DevNova Inc. All rights reserved.</p>
          <div className="d-flex gap-3">
            <span>Privacy Policy</span>
            <span>&bull;</span>
            <span>Terms of Service</span>
            <span>&bull;</span>
            <span>Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
