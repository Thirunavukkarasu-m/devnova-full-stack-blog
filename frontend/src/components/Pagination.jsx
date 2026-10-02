import React from "react";

export const Pagination = ({ meta, onPageChange }) => {
  if (!meta || meta.pages <= 1) return null;

  const { page, pages, has_prev, has_next } = meta;

  // Generate visible page numbers around current page
  const pageNumbers = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(pages, page + 2);

  for (let i = start; i <= end; i++) {
    pageNumbers.push(i);
  }

  return (
    <nav className="d-flex justify-content-center my-4" aria-label="Blog pagination">
      <ul className="pagination gap-1">
        <li className={`page-item ${!has_prev ? "disabled" : ""}`}>
          <button
            className="page-link rounded-start-3 btn-outline-dev"
            onClick={() => onPageChange(page - 1)}
            disabled={!has_prev}
          >
            &laquo; Previous
          </button>
        </li>

        {start > 1 && (
          <>
            <li className="page-item">
              <button className="page-link btn-outline-dev" onClick={() => onPageChange(1)}>
                1
              </button>
            </li>
            {start > 2 && <li className="page-item disabled"><span className="page-link border-0">...</span></li>}
          </>
        )}

        {pageNumbers.map((num) => (
          <li key={num} className={`page-item ${num === page ? "active" : ""}`}>
            <button
              className={`page-link ${num === page ? "btn-primary-gradient text-white border-0" : "btn-outline-dev"}`}
              onClick={() => onPageChange(num)}
            >
              {num}
            </button>
          </li>
        ))}

        {end < pages && (
          <>
            {end < pages - 1 && <li className="page-item disabled"><span className="page-link border-0">...</span></li>}
            <li className="page-item">
              <button className="page-link btn-outline-dev" onClick={() => onPageChange(pages)}>
                {pages}
              </button>
            </li>
          </>
        )}

        <li className={`page-item ${!has_next ? "disabled" : ""}`}>
          <button
            className="page-link rounded-end-3 btn-outline-dev"
            onClick={() => onPageChange(page + 1)}
            disabled={!has_next}
          >
            Next &raquo;
          </button>
        </li>
      </ul>
    </nav>
  );
};
