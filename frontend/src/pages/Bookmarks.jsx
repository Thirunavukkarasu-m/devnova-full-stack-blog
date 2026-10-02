import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { blogApi } from "../services/blogApi";
import { BlogList } from "../components/BlogList";
import { Pagination } from "../components/Pagination";

export const Bookmarks = () => {
  const [blogs, setBlogs] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookmarks();
  }, [page]);

  const loadBookmarks = async () => {
    try {
      setLoading(true);
      const res = await blogApi.getMyBookmarks({ page, limit: 9 });
      setBlogs(res.items || []);
      setMeta(res.meta || null);
      document.title = "My Bookmarks — DevNova";
    } catch (err) {
      console.error("Failed to load bookmarks:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookmarkChange = (blogId, res) => {
    if (!res.is_bookmarked) {
      setBlogs((prev) => prev.filter((b) => b.id !== blogId));
    }
  };

  return (
    <div className="container px-4 px-lg-5 py-5">
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Saved Bookmarks</h2>
        <p className="text-muted small">Articles you've saved for later study and reference</p>
      </div>

      <BlogList
        blogs={blogs}
        loading={loading}
        emptyMessage="You haven't bookmarked any articles yet. Explore tech topics and bookmark insights for later reference."
        emptyAction={
          <Link to="/explore" className="btn btn-primary-gradient btn-sm">
            Explore Articles Now
          </Link>
        }
        onBookmarkChange={handleBookmarkChange}
      />

      <Pagination meta={meta} onPageChange={(p) => setPage(p)} />
    </div>
  );
};
