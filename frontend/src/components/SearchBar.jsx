import React, { useState } from "react";

export const SearchBar = ({ onSearch, initialValue = "", placeholder = "Search articles by title, content, author, or tags..." }) => {
  const [query, setQuery] = useState(initialValue);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query.trim());
  };

  const handleClear = () => {
    setQuery("");
    onSearch("");
  };

  return (
    <form onSubmit={handleSubmit} className="position-relative w-100">
      <div className="input-group">
        <span className="input-group-text bg-transparent border-end-0 ps-3" style={{ borderColor: "var(--dn-border)" }}>
          <i className="bi bi-search text-muted"></i>
        </span>
        <input
          type="text"
          className="form-control bg-transparent border-start-0 border-end-0 py-2 ps-1"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ borderColor: "var(--dn-border)" }}
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="input-group-text bg-transparent border-start-0 border-end-0 text-muted"
            style={{ borderColor: "var(--dn-border)", cursor: "pointer" }}
          >
            <i className="bi bi-x-circle"></i>
          </button>
        )}
        <button
          type="submit"
          className="btn btn-primary-gradient px-4"
        >
          Search
        </button>
      </div>
    </form>
  );
};
