import React from "react";
import { BlogCard } from "./BlogCard";
import { BlogCardSkeleton } from "./Skeleton";

export const BlogList = ({
  blogs = [],
  loading = false,
  emptyMessage = "No technical articles found matching your criteria.",
  emptyAction,
  onLikeChange,
  onBookmarkChange,
}) => {
  if (loading) {
    return (
      <div className="row">
        {Array.from({ length: 6 }).map((_, i) => (
          <BlogCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!blogs || blogs.length === 0) {
    return (
      <div className="dev-card p-5 text-center my-4">
        <div
          className="mx-auto mb-3 d-flex align-items-center justify-content-center text-primary rounded-circle"
          style={{ width: "64px", height: "64px", backgroundColor: "var(--dn-primary-soft)" }}
        >
          <i className="bi bi-journal-x fs-2"></i>
        </div>
        <h5 className="fw-bold mb-2">No Articles Found</h5>
        <p className="text-muted small mb-4" style={{ maxWidth: "400px", margin: "0 auto" }}>
          {emptyMessage}
        </p>
        {emptyAction && <div>{emptyAction}</div>}
      </div>
    );
  }

  return (
    <div className="row">
      {blogs.map((blog) => (
        <BlogCard
          key={blog.id}
          blog={blog}
          onLikeChange={onLikeChange}
          onBookmarkChange={onBookmarkChange}
        />
      ))}
    </div>
  );
};
