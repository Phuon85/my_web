import axios from 'axios';

// ── Axios instance ────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Tự động gắn JWT vào mọi request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Tự về /login nếu token hết hạn
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
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
  toggleActive: id            => api.patch(`/users/${id}/toggle-active`),
  changeRole:   (id, role)    => api.patch(`/users/${id}/role`, null, { params: { role } }),
  delete:       id            => api.delete(`/users/${id}`),
};

// ── Contest ───────────────────────────────────────────────────────────────────
export const contestAPI = {
  getAll:       params        => api.get('/contests', { params }),
  getById:      id            => api.get(`/contests/${id}`),
  create:       data          => api.post('/contests', data),
  update:       (id, data)    => api.put(`/contests/${id}`, data),
  delete:       id            => api.delete(`/contests/${id}`),
  register:     id            => api.post(`/contests/${id}/register`),
  publish:      id            => api.patch(`/contests/${id}/publish`),
  participants: id            => api.get(`/contests/${id}/participants`),
  results:      id            => api.get(`/contests/${id}/results`),
};

// ── Document ──────────────────────────────────────────────────────────────────
export const documentAPI = {
  getAll:    params    => api.get('/documents', { params }),
  getById:   id        => api.get(`/documents/${id}`),
  download:  id        => `/api/documents/${id}/download`, // URL trực tiếp
  myDocs:    ()        => api.get('/documents/my'),
  delete:    id        => api.delete(`/documents/${id}`),
  upload: (formData)   => api.post('/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id, params) => api.put(`/documents/${id}`, null, { params }),
};

// ── Roadmap ───────────────────────────────────────────────────────────────────
export const roadmapAPI = {
  getAll:   params       => api.get('/roadmaps', { params }),
  getById:  id           => api.get(`/roadmaps/${id}`),
  create:   data         => api.post('/roadmaps', data),
  update:   (id, data)   => api.put(`/roadmaps/${id}`, data),
  delete:   id           => api.delete(`/roadmaps/${id}`),
  addChapter:    (id, data) => api.post(`/roadmaps/${id}/chapters`, data),
  updateChapter: (id, data) => api.put(`/roadmaps/chapters/${id}`, data),
  deleteChapter: id         => api.delete(`/roadmaps/chapters/${id}`),
  addFile:    (chapterId, data) => api.post(`/roadmaps/chapters/${chapterId}/files`, data),
  removeFile: id               => api.delete(`/roadmaps/files/${id}`),
};