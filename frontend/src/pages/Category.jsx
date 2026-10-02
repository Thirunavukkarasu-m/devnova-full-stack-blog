import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { blogApi } from "../services/blogApi";
import { BlogList } from "../components/BlogList";
import { Pagination } from "../components/Pagination";

export const Category = () => {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [meta, setMeta] = useState(null);
  const [allCategories, setAllCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPage(1);
  }, [slug]);

  useEffect(() => {
    loadCategoryData();
  }, [slug, page]);

  const loadCategoryData = async () => {
    try {
      setLoading(true);
      const [catData, blogsData, allCats] = await Promise.all([
        blogApi.getCategory(slug),
        blogApi.getBlogs({ category: slug, page, limit: 9 }),
        blogApi.getCategories(),
      ]);

      setCategory(catData);
      setBlogs(blogsData.items || []);
      setMeta(blogsData.meta || null);
      setAllCategories(allCats || []);
      document.title = `${catData.name} Articles — DevNova`;
    } catch (err) {
      console.error("Failed to load category:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container px-4 px-lg-5 py-5">
      {/* Category Hero Banner */}
      {category && (
        <div className="dev-card p-4 p-md-5 mb-5 position-relative overflow-hidden">
          <div className="row align-items-center g-4 position-relative" style={{ zIndex: 1 }}>
            <div className="col-12 col-md-8">
              <div className="badge badge-tech mb-2">Category</div>
              <h1 className="display-5 fw-extrabold mb-3">{category.name}</h1>
              <p className="lead text-muted mb-3" style={{ fontSize: "1.1rem" }}>
                {category.description || `Read in-depth guides, architecture lessons, and best practices about ${category.name}.`}
              </p>
              <div className="text-muted small">
                <strong>{category.article_count || 0}</strong> {category.article_count === 1 ? "article" : "articles"} published
              </div>
            </div>

            <div className="col-12 col-md-4 text-center">
              <img
                src={category.image || "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=400&q=80"}
                alt={category.name}
                className="rounded-4 shadow-lg w-100 object-fit-cover"
                style={{ maxHeight: "180px", maxWidth: "280px" }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Categories quick pill switchers */}
      <div className="d-flex align-items-center gap-2 overflow-x-auto pb-3 mb-4">
        {allCategories.map((c) => (
          <Link
            key={c.id}
            to={`/category/${c.slug}`}
            className={`badge text-decoration-none px-3 py-2 rounded-pill whitespace-nowrap ${
              c.slug === slug ? "btn-primary-gradient text-white" : "btn-outline-dev"
            }`}
          >
            {c.name} ({c.article_count || 0})
          </Link>
        ))}
      </div>

      {/* Blogs in this category */}
      <BlogList
        blogs={blogs}
        loading={loading}
        emptyMessage={`No published articles in ${category?.name || "this category"} yet.`}
      />

      <Pagination meta={meta} onPageChange={(p) => setPage(p)} />
    </div>
  );
};
