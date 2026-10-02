import api from "./api";

export const blogApi = {
  getBlogs: async (params = {}) => {
    const response = await api.get("/blogs", { params });
    return response.data;
  },

  getBlogBySlug: async (slugOrId) => {
    const response = await api.get(`/blogs/${slugOrId}`);
    return response.data;
  },

  getRelatedBlogs: async (slugOrId) => {
    const response = await api.get(`/blogs/${slugOrId}/related`);
    return response.data;
  },

  recordView: async (slug) => {
    try {
      const response = await api.post(`/blogs/${slug}/view`);
      return response.data;
    } catch {
      return null;
    }
  },

  createBlog: async (blogData) => {
    const response = await api.post("/blogs", blogData);
    return response.data;
  },

  updateBlog: async (id, blogData) => {
    const response = await api.put(`/blogs/${id}`, blogData);
    return response.data;
  },

  deleteBlog: async (id) => {
    const response = await api.delete(`/blogs/${id}`);
    return response.data;
  },

  toggleLike: async (id) => {
    const response = await api.post(`/blogs/${id}/like`);
    return response.data;
  },

  toggleBookmark: async (id) => {
    const response = await api.post(`/blogs/${id}/bookmark`);
    return response.data;
  },

  getMyBlogs: async (params = {}) => {
    const response = await api.get("/blogs/user/my-blogs", { params });
    return response.data;
  },

  getMyBookmarks: async (params = {}) => {
    const response = await api.get("/blogs/user/bookmarks", { params });
    return response.data;
  },

  getComments: async (blogId) => {
    const response = await api.get(`/comments/blog/${blogId}`);
    return response.data;
  },

  addComment: async (blogId, commentData) => {
    const response = await api.post(`/comments/blog/${blogId}`, commentData);
    return response.data;
  },

  updateComment: async (commentId, data) => {
    const response = await api.put(`/comments/${commentId}`, data);
    return response.data;
  },

  deleteComment: async (commentId) => {
    const response = await api.delete(`/comments/${commentId}`);
    return response.data;
  },

  toggleCommentLike: async (commentId) => {
    const response = await api.post(`/comments/${commentId}/like`);
    return response.data;
  },

  reportComment: async (commentId, data) => {
    const response = await api.post(`/comments/${commentId}/report`, data);
    return response.data;
  },

  getCategories: async () => {
    const response = await api.get("/categories");
    return response.data;
  },

  getCategory: async (slug) => {
    const response = await api.get(`/categories/${slug}`);
    return response.data;
  },

  getTags: async () => {
    const response = await api.get("/tags");
    return response.data;
  },

  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post("/upload/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};
