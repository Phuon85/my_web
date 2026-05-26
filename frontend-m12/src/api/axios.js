import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

// Tự động gắn JWT token
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Tự động logout khi 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  login:            data => api.post('/auth/login', data),
  registerInternal: data => api.post('/auth/register/internal', data),
  registerExternal: data => api.post('/auth/register/external', data),
  me:               ()   => api.get('/auth/me'),
};

// ── User ──────────────────────────────────────────────────────────────────────
export const userAPI = {
  leaderboard:    (limit = 10) => api.get(`/users/leaderboard?limit=${limit}`),
  updateMe:       data         => api.put('/users/me', data),
  changePassword: data         => api.post('/users/me/change-password', data),
  stats:          ()           => api.get('/users/stats'),
  // Admin
  getAll:       params        => api.get('/users', { params }),
  getById:      id            => api.get(`/users/${id}`),
  create:       data          => api.post('/users', data),
  update:       (id, data)    => api.put(`/users/${id}`, data),
  toggleActive: id            => api.patch(`/users/${id}/toggle-active`),
  changeRole:   (id, role)    => api.patch(`/users/${id}/role`, null, { params: { role } }),
  delete:       id            => api.delete(`/users/${id}`),
  resetPassword: id => api.patch(`/users/${id}/reset-password`),
};

// ── Contest ───────────────────────────────────────────────────────────────────
export const contestAPI = {
  // Public
  getAll:         params        => api.get('/contests', { params }),
  getById:        id            => api.get(`/contests/${id}`),
  getParticipants:id            => api.get(`/contests/${id}/participants`),
  register:       id            => api.post(`/contests/${id}/register`),
  // Teacher+
  create:         data          => api.post('/contests', data),
  update:         (id, data)    => api.put(`/contests/${id}`, data),
  publish:        id            => api.patch(`/contests/${id}/publish`),
  restore:        id            => api.patch(`/contests/${id}/restore`),
  // Admin
  adminGetAll:    params        => api.get('/contests/admin', { params }),
  delete:         id            => api.delete(`/contests/${id}`),
};

// ── Document ──────────────────────────────────────────────────────────────────
export const documentAPI = {
  getAll:    params    => api.get('/documents', { params }),
  getById:   id        => api.get(`/documents/${id}`),
  upload:    formData  => api.post('/documents', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update:    (id, params) => api.put(`/documents/${id}`, null, { params }),
  delete:    id        => api.delete(`/documents/${id}`),
  download:  id        => api.get(`/documents/${id}/download`, { responseType: 'blob' }),
  myDocs:    ()        => api.get('/documents/my'),
};

// ── Roadmap ───────────────────────────────────────────────────────────────────
export const roadmapAPI = {
  getAll:   params       => api.get('/roadmaps', { params }),
  getById:  id           => api.get(`/roadmaps/${id}`),
  create:   data         => api.post('/roadmaps', data),
  update:   (id, data)   => api.put(`/roadmaps/${id}`, data),
  delete:   id           => api.delete(`/roadmaps/${id}`),
  // Chapters
  addChapter:    (roadmapId, data) => api.post(`/roadmaps/${roadmapId}/chapters`, data),
  updateChapter: (chapterId, data) => api.put(`/roadmaps/chapters/${chapterId}`, data),
  deleteChapter: id                => api.delete(`/roadmaps/chapters/${id}`),
  // Files
  addFile:    (chapterId, data) => api.post(`/roadmaps/chapters/${chapterId}/files`, data),
  removeFile: id                => api.delete(`/roadmaps/files/${id}`),
};

// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminAPI = {
  dashboard: ()       => api.get('/admin/dashboard'),
  logs:      params   => api.get('/admin/logs', { params }),
};
// ── Forum ─────────────────────────────────────────────────────────────────────
export const forumAPI = {
  // Danh sách bài gốc (phân trang)
  getThreads:  (params) => api.get('/forum/threads', { params }),
  // Chi tiết bài gốc + tăng view
  getThread:   (id)     => api.get(`/forum/threads/${id}`),
  // Bình luận của bài gốc
  getComments: (id)     => api.get(`/forum/threads/${id}/comments`),
  // Tạo bài gốc (parentId=null) hoặc bình luận
  create:      (data)   => api.post('/forum/posts', data),
  // Sửa
  update:      (id, data) => api.put(`/forum/posts/${id}`, data),
  // Xóa
  delete:      (id)     => api.delete(`/forum/posts/${id}`),
  // Ghim / Bỏ ghim
  togglePin:   (id)     => api.patch(`/forum/posts/${id}/pin`),
  // Ẩn / Hiện
  toggleHide:  (id)     => api.patch(`/forum/posts/${id}/hide`),
  // Like / Unlike
  toggleLike:  (id)     => api.patch(`/forum/posts/${id}/like`),
};

// ── News ──────────────────────────────────────────────────────────────────────
export const newsAPI = {
  // Danh sách tin đã xuất bản
  getAll:         (params)     => api.get('/news', { params }),
  // Tin nổi bật
  getFeatured:    ()           => api.get('/news/featured'),
  // Chi tiết 1 tin
  getById:        (id)         => api.get(`/news/${id}`),
  // Admin: tất cả kể cả draft
  adminGetAll:    (params)     => api.get('/news/admin/all', { params }),
  // Tạo bài tin
  create:         (data)       => api.post('/news', data),
  // Sửa
  update:         (id, data)   => api.put(`/news/${id}`, data),
  // Xuất bản / Thu hồi
  togglePublish:  (id)         => api.patch(`/news/${id}/publish`),
  // Nổi bật / Bỏ nổi bật
  toggleFeatured: (id)         => api.patch(`/news/${id}/feature`),
  // Xóa
  delete:         (id)         => api.delete(`/news/${id}`),
};

// ── Team ──────────────────────────────────────────────────────────────────────
export const teamAPI = {
  // Public
  getAll:          ()                       => api.get('/teams'),
  getById:         (id)                     => api.get(`/teams/${id}`),
  // Admin
  adminGetAll:     (q)                      => api.get('/teams/admin/all', { params: { q } }),
  create:          (data)                   => api.post('/teams', data),
  update:          (id, data)               => api.put(`/teams/${id}`, data),
  toggleActive:    (id)                     => api.patch(`/teams/${id}/toggle-active`),
  delete:          (id)                     => api.delete(`/teams/${id}`),
  // Members
  addMember:       (teamId, data)           => api.post(`/teams/${teamId}/members`, data),
  removeMember:    (teamId, userId)         => api.delete(`/teams/${teamId}/members/${userId}`),
  updateMemberRole:(teamId, userId, role)   => api.patch(`/teams/${teamId}/members/${userId}/role`, null, { params: { role } }),
};
// ── Exercise ──────────────────────────────────────────────────────────────────
export const exerciseAPI = {
  // Danh sách & chi tiết
  getAll:         (params)          => api.get('/exercises', { params }),
  getById:        (id)              => api.get(`/exercises/${id}`),
  // Teacher+
  create:         (data)            => api.post('/exercises', data),
  update:         (id, data)        => api.put(`/exercises/${id}`, data),
  delete:         (id)              => api.delete(`/exercises/${id}`),
  publish:        (id)              => api.patch(`/exercises/${id}/publish`),
  // Câu hỏi
  addQuestion:    (exId, data)      => api.post(`/exercises/${exId}/questions`, data),
  updateQuestion: (exId, qId, data) => api.put(`/exercises/${exId}/questions/${qId}`, data),
  deleteQuestion: (exId, qId)       => api.delete(`/exercises/${exId}/questions/${qId}`),
  reorderQuestions:(exId, ids)      => api.patch(`/exercises/${exId}/questions/reorder`, { ids }),
  // Học sinh làm bài
  start:          (id)              => api.post(`/exercises/${id}/start`),
  submit:         (id, answers)     => api.post(`/exercises/${id}/submit`, { answers }),
  myResult:       (id)              => api.get(`/exercises/${id}/my-result`),
  // Kết quả (Teacher xem)
  getResults:     (id, params)      => api.get(`/exercises/${id}/results`, { params }),
};
