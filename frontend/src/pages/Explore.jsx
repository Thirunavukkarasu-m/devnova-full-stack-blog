import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { blogApi } from "../services/blogApi";
import { BlogList } from "../components/BlogList";
import { Pagination } from "../components/Pagination";
import { SearchBar } from "../components/SearchBar";

export const Explore = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [blogs, setBlogs] = useState([]);
  const [meta, setMeta] = useState(null);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentCategory = searchParams.get("category") || "";
  const currentTag = searchParams.get("tag") || "";
  const currentSort = searchParams.get("sort") || "latest";
  const currentSearch = searchParams.get("q") || "";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  useEffect(() => {
    loadFilters();
  }, []);

  useEffect(() => {
    loadBlogs();
  }, [searchParams]);

  const loadFilters = async () => {
    try {
      const [cats, tgs] = await Promise.all([
        blogApi.getCategories(),
        blogApi.getTags(),
      ]);
      setCategories(cats || []);
      setTags(tgs || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadBlogs = async () => {
    try {
      setLoading(true);
      const res = await blogApi.getBlogs({
        search: currentSearch || undefined,
        category: currentCategory || undefined,
        tag: currentTag || undefined,
        sort_by: currentSort,
        page: currentPage,
        limit: 9,
      });
      setBlogs(res.items || []);
      setMeta(res.meta || null);
    } catch (err) {
      console.error("Failed to load explore blogs:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    // reset to page 1 on filter changes unless changing page
    if (key !== "page") {
      newParams.set("page", "1");
    }
    setSearchParams(newParams);
  };

  return (
    <div className="container px-4 px-lg-5 py-5">
      {/* Header */}
      <div className="mb-4">
        <h2 className="fw-bold mb-2">Explore Articles</h2>
        <p className="text-muted">
          Browse technical tutorials, system design guides, and community discussions.
        </p>
      </div>

      {/* Filter and Search Controls */}
      <div className="dev-card p-4 mb-4">
        <div className="row g-3">
          {/* Search Bar */}
          <div className="col-12 col-md-5">
            <SearchBar
              initialValue={currentSearch}
              placeholder="Filter by keyword or title..."
              onSearch={(val) => updateParam("q", val)}
            />
          </div>

          {/* Category Dropdown */}
          <div className="col-6 col-md-3">
            <select
              className="form-select bg-transparent text-body"
              value={currentCategory}
              onChange={(e) => updateParam("category", e.target.value)}
              style={{ borderColor: "var(--dn-border)" }}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug} className="text-dark">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="col-6 col-md-2">
            <select
              className="form-select bg-transparent text-body"
              value={currentSort}
              onChange={(e) => updateParam("sort", e.target.value)}
              style={{ borderColor: "var(--dn-border)" }}
            >
              <option value="latest" className="text-dark">Latest</option>
              <option value="views" className="text-dark">Most Viewed</option>
              <option value="likes" className="text-dark">Most Liked</option>
              <option value="oldest" className="text-dark">Oldest</option>
            </select>
          </div>

          {/* Reset Filters Button */}
          <div className="col-12 col-md-2 d-flex">
            <button
              onClick={() => setSearchParams({})}
              className="btn btn-outline-dev w-100"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Popular Tags Pills */}
        {tags.length > 0 && (
          <div className="mt-3 pt-3 border-top d-flex align-items-center flex-wrap gap-2" style={{ borderColor: "var(--dn-border)" }}>
            <span className="small text-muted me-1">Popular Tags:</span>
            {tags.slice(0, 8).map((t) => (
              <button
                key={t.id}
                onClick={() => updateParam("tag", currentTag === t.slug ? "" : t.slug)}
                className={`badge badge-tag border-0 ${currentTag === t.slug ? "btn-primary-gradient text-white" : ""}`}
                style={{ cursor: "pointer" }}
              >
                #{t.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Blogs Grid */}
      <BlogList
        blogs={blogs}
        loading={loading}
        emptyMessage="No articles matched your selected filters. Try broadening your query or selecting another category."
        emptyAction={
          <button onClick={() => setSearchParams({})} className="btn btn-primary-gradient btn-sm">
            Clear Filters
          </button>
        }
      />

      {/* Pagination */}
      <Pagination
        meta={meta}
        onPageChange={(p) => updateParam("page", p.toString())}
      />
    </div>
  );
};
