import React from "react";

export const BlogCardSkeleton = () => {
  return (
    <div className="col-12 col-md-6 col-lg-4 mb-4">
      <div className="dev-card h-100 p-0">
        <div className="skeleton" style={{ height: "200px", width: "100%", borderRadius: "14px 14px 0 0" }}></div>
        <div className="p-4 d-flex flex-column h-100">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="skeleton" style={{ height: "20px", width: "80px" }}></div>
            <div className="skeleton" style={{ height: "16px", width: "60px" }}></div>
          </div>
          <div className="skeleton mb-2" style={{ height: "24px", width: "90%" }}></div>
          <div className="skeleton mb-3" style={{ height: "24px", width: "70%" }}></div>
          <div className="skeleton mb-2" style={{ height: "16px", width: "100%" }}></div>
          <div className="skeleton mb-4" style={{ height: "16px", width: "85%" }}></div>
          <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center" style={{ borderColor: "var(--dn-border)" }}>
            <div className="d-flex align-items-center gap-2">
              <div className="skeleton rounded-circle" style={{ width: "36px", height: "36px" }}></div>
              <div className="skeleton" style={{ height: "16px", width: "100px" }}></div>
            </div>
            <div className="skeleton" style={{ height: "16px", width: "50px" }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const TableRowSkeleton = ({ cols = 5 }) => {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="py-3">
          <div className="skeleton" style={{ height: "20px", width: i === 0 ? "80%" : "60%" }}></div>
        </td>
      ))}
    </tr>
  );
};
