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