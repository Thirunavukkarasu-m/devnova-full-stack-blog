import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { blogApi } from "../services/blogApi";
import { BlogList } from "../components/BlogList";
import { Pagination } from "../components/Pagination";
import { SearchBar } from "../components/SearchBar";

export const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);

  const [blogs, setBlogs] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query) {
      performSearch();
    } else {
      setBlogs([]);
      setMeta(null);
    }
  }, [query, page]);

  const performSearch = async () => {
    try {
      setLoading(true);
      const res = await blogApi.getBlogs({ search: query, page, limit: 9 });
      setBlogs(res.items || []);
      setMeta(res.meta || null);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewSearch = (newQuery) => {
    if (newQuery) {
      setSearchParams({ q: newQuery, page: "1" });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="container px-4 px-lg-5 py-5">
      <div className="mb-4">
        <h2 className="fw-bold mb-2">Search Articles</h2>
        <p className="text-muted">
          Find architectural guides, language internals, and tutorials across DevNova.
        </p>

        <div className="dev-card p-4 mt-3" style={{ maxWidth: "700px" }}>
          <SearchBar
            initialValue={query}
            placeholder="Type technology, keyword, tag, or author..."
            onSearch={handleNewSearch}
          />
        </div>
      </div>

      {query && (
        <div className="d-flex align-items-center justify-content-between mb-4 pb-2 border-bottom" style={{ borderColor: "var(--dn-border)" }}>
          <h5 className="fw-bold mb-0">
            Search results for: <span className="text-primary">"{query}"</span>
          </h5>
          <span className="text-muted small">
            {meta ? `${meta.total} result${meta.total === 1 ? "" : "s"} found` : ""}
          </span>
        </div>
      )}

      {query ? (
        <>
          <BlogList
            blogs={blogs}
            loading={loading}
            emptyMessage={`We could not find any articles matching "${query}". Try searching for terms like "FastAPI", "React", "PostgreSQL", or "Docker".`}
          />
          <Pagination
            meta={meta}
            onPageChange={(p) => setSearchParams({ q: query, page: p.toString() })}
          />
        </>
      ) : (
        <div className="dev-card p-5 text-center text-muted my-4">
          <i className="bi bi-search fs-1 text-dim d-block mb-3"></i>
          <p>Type in keywords above to search all articles, authors, and topics across DevNova.</p>
        </div>
      )}
    </div>
  );
};
