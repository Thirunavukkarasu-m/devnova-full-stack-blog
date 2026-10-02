import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { blogApi } from "../services/blogApi";
import { formatDate } from "../utils/helpers";

export const CommentSection = ({ blogId }) => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyToId, setReplyToId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [reportingComment, setReportingComment] = useState(null);
  const [reportReason, setReportReason] = useState("Spam");
  const [reportDetails, setReportDetails] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [blogId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const data = await blogApi.getComments(blogId);
      setComments(data || []);
    } catch (err) {
      console.error("Failed to load comments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const created = await blogApi.addComment(blogId, { content: newComment.trim() });
      setComments([created, ...comments]);
      setNewComment("");
    } catch (err) {
      alert("Failed to post comment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplySubmit = async (parentId, e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    try {
      const created = await blogApi.addComment(blogId, {
        content: replyText.trim(),
        parent_id: parentId,
      });

      // Insert reply into parent's replies
      setComments((prev) =>
        prev.map((c) => {
          if (c.id === parentId) {
            return { ...c, replies: [...(c.replies || []), created] };
          }
          return c;
        })
      );
      setReplyToId(null);
      setReplyText("");
    } catch (err) {
      alert("Failed to post reply.");
    }
  };

  const handleEditSubmit = async (commentId, e) => {
    e.preventDefault();
    if (!editText.trim()) return;
    try {
      await blogApi.updateComment(commentId, { content: editText.trim() });
      await loadComments();
      setEditingId(null);
      setEditText("");
    } catch (err) {
      alert("Failed to edit comment.");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    try {
      await blogApi.deleteComment(commentId);
      await loadComments();
    } catch (err) {
      alert("Failed to delete comment.");
    }
  };

  const handleToggleLike = async (commentId) => {
    if (!isAuthenticated) {
      alert("Please log in to like comments.");
      return;
    }
    try {
      const res = await blogApi.toggleCommentLike(commentId);
      // update state
      const updateLikeInTree = (list) =>
        list.map((c) => {
          if (c.id === commentId) {
            return { ...c, is_liked: res.is_liked, likes_count: res.likes_count };
          }
          if (c.replies && c.replies.length > 0) {
            return { ...c, replies: updateLikeInTree(c.replies) };
          }
          return c;
        });
      setComments(updateLikeInTree(comments));
    } catch (err) {
      console.error(err);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportingComment) return;
    setReportSubmitting(true);
    try {
      await blogApi.reportComment(reportingComment.id, {
        reason: reportReason,
        details: reportDetails,
      });
      alert("Comment reported. Our moderation team will review it.");
      setReportingComment(null);
      setReportDetails("");
    } catch (err) {
      alert("Failed to submit report.");
    } finally {
      setReportSubmitting(false);
    }
  };

  const renderComment = (item, isReply = false) => {
    const isOwner = user && user.id === item.user_id;
    const canDelete = isOwner || isAdmin;

    return (
      <div
        key={item.id}
        className={`d-flex gap-3 mb-3 ${isReply ? "ms-4 ms-md-5 pt-2 border-start ps-3" : "pt-3 border-top"}`}
        style={{ borderColor: "var(--dn-border)" }}
      >
        <Link to={`/profile/${item.user?.username}`}>
          <img
            src={item.user?.profile_image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"}
            alt={item.user?.username}
            className="rounded-circle border"
            style={{ width: isReply ? "32px" : "40px", height: isReply ? "32px" : "40px", objectFit: "cover", borderColor: "var(--dn-border)" }}
          />
        </Link>
        <div className="flex-grow-1">
          <div className="d-flex align-items-center justify-content-between mb-1">
            <div className="d-flex align-items-center gap-2">
              <Link to={`/profile/${item.user?.username}`} className="fw-semibold text-body text-decoration-none small">
                {item.user?.first_name} {item.user?.last_name}
              </Link>
              <span className="text-muted" style={{ fontSize: "0.75rem" }}>
                @{item.user?.username} &bull; {formatDate(item.created_at)}
              </span>
            </div>

            {/* Action Menu (Delete, Edit, Report) */}
            <div className="d-flex gap-2">
              {isOwner && !item.is_deleted && (
                <button
                  onClick={() => {
                    setEditingId(item.id);
                    setEditText(item.content);
                  }}
                  className="btn btn-sm btn-link text-muted p-0 text-decoration-none"
                  style={{ fontSize: "0.75rem" }}
                >
                  Edit
                </button>
              )}
              {canDelete && (
                <button
                  onClick={() => handleDeleteComment(item.id)}
                  className="btn btn-sm btn-link text-danger p-0 text-decoration-none"
                  style={{ fontSize: "0.75rem" }}
                >
                  Delete
                </button>
              )}
              {isAuthenticated && !isOwner && !item.is_deleted && (
                <button
                  onClick={() => setReportingComment(item)}
                  className="btn btn-sm btn-link text-muted p-0 text-decoration-none"
                  style={{ fontSize: "0.75rem" }}
                >
                  Report
                </button>
              )}
            </div>
          </div>

          {/* Comment Content or Edit Form */}
          {editingId === item.id ? (
            <form onSubmit={(e) => handleEditSubmit(item.id, e)} className="my-2">
              <textarea
                className="form-control form-control-sm mb-2"
                rows="2"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                required
              />
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary-gradient btn-sm">Save</button>
                <button type="button" onClick={() => setEditingId(null)} className="btn btn-outline-dev btn-sm">Cancel</button>
              </div>
            </form>
          ) : (
            <p className={`small mb-2 ${item.is_deleted ? "text-muted fst-italic" : "text-body"}`}>
              {item.content}
            </p>
          )}

          {/* Actions: Like, Reply */}
          {!item.is_deleted && (
            <div className="d-flex align-items-center gap-3 text-muted small">
              <button
                onClick={() => handleToggleLike(item.id)}
                className={`btn btn-sm p-0 border-0 d-flex align-items-center gap-1 ${item.is_liked ? "text-danger" : "text-muted"}`}
                style={{ fontSize: "0.8rem" }}
              >
                <i className={`bi ${item.is_liked ? "bi-heart-fill" : "bi-heart"}`}></i>
                <span>{item.likes_count || 0}</span>
              </button>

              {isAuthenticated && !isReply && (
                <button
                  onClick={() => {
                    setReplyToId(replyToId === item.id ? null : item.id);
                    setReplyText("");
                  }}
                  className="btn btn-sm p-0 border-0 text-muted d-flex align-items-center gap-1"
                  style={{ fontSize: "0.8rem" }}
                >
                  <i className="bi bi-reply"></i> Reply
                </button>
              )}
            </div>
          )}

          {/* Inline Reply Form */}
          {replyToId === item.id && (
            <form onSubmit={(e) => handleReplySubmit(item.id, e)} className="mt-3 p-3 dev-card">
              <div className="mb-2">
                <textarea
                  className="form-control form-control-sm bg-transparent"
                  rows="2"
                  placeholder={`Replying to @${item.user?.username}...`}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  required
                />
              </div>
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary-gradient btn-sm">Post Reply</button>
                <button type="button" onClick={() => setReplyToId(null)} className="btn btn-outline-dev btn-sm">Cancel</button>
              </div>
            </form>
          )}

          {/* Render Nested Replies */}
          {item.replies && item.replies.length > 0 && (
            <div className="mt-3">
              {item.replies.map((reply) => renderComment(reply, true))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="mt-5 pt-4 border-top" style={{ borderColor: "var(--dn-border)" }}>
      <h4 className="fw-bold mb-4 d-flex align-items-center gap-2">
        <i className="bi bi-chat-left-text text-primary"></i>
        <span>Discussion ({comments.length})</span>
      </h4>

      {/* New Comment Input */}
      {isAuthenticated ? (
        <form onSubmit={handleCreateComment} className="mb-5 dev-card p-4">
          <div className="d-flex gap-3 align-items-start">
            <img
              src={user?.profile_image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"}
              alt={user?.username}
              className="rounded-circle border"
              style={{ width: "42px", height: "42px", objectFit: "cover", borderColor: "var(--dn-border)" }}
            />
            <div className="flex-grow-1">
              <textarea
                className="form-control bg-transparent mb-3"
                rows="3"
                placeholder="Share your technical thoughts, critique, or questions..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                required
                style={{ borderColor: "var(--dn-border)" }}
              />
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className="btn btn-primary-gradient d-flex align-items-center gap-2"
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                    <span>Posting...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-send-fill"></i>
                    <span>Post Comment</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="dev-card p-4 text-center mb-5">
          <p className="mb-3 text-muted">Join the discussion to share your thoughts, feedback, or technical questions.</p>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/login" className="btn btn-outline-dev btn-sm">Log In</Link>
            <Link to="/register" className="btn btn-primary-gradient btn-sm">Sign Up</Link>
          </div>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-chat-square-dots fs-1 d-block mb-2 text-dim"></i>
          <p>No comments yet. Be the first to start the conversation!</p>
        </div>
      ) : (
        <div className="comments-stream">
          {comments.map((c) => renderComment(c))}
        </div>
      )}

      {/* Report Modal */}
      {reportingComment && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.6)" }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content dev-card border-0">
              <div className="modal-header border-bottom" style={{ borderColor: "var(--dn-border)" }}>
                <h5 className="modal-title fw-bold">Report Comment</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setReportingComment(null)}
                ></button>
              </div>
              <form onSubmit={handleReportSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Reason for Report</label>
                    <select
                      className="form-select bg-transparent"
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                    >
                      <option value="Spam">Spam</option>
                      <option value="Abusive content">Abusive content</option>
                      <option value="Copyright">Copyright violation</option>
                      <option value="Misleading content">Misleading content</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Additional Details (Optional)</label>
                    <textarea
                      className="form-control bg-transparent"
                      rows="3"
                      placeholder="Explain why this content violates community guidelines..."
                      value={reportDetails}
                      onChange={(e) => setReportDetails(e.target.value)}
                    />
                  </div>
                </div>
                <div className="modal-footer border-top" style={{ borderColor: "var(--dn-border)" }}>
                  <button
                    type="button"
                    className="btn btn-outline-dev btn-sm"
                    onClick={() => setReportingComment(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={reportSubmitting}
                    className="btn btn-danger btn-sm"
                  >
                    {reportSubmitting ? "Submitting..." : "Submit Report"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
