import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
});

console.log("ENV API URL:", import.meta.env.VITE_API_URL);
console.log("AXIOS BASE URL:", api.defaults.baseURL);

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('qf_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Expired or invalid session: clear it and let the app redirect to login.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url || '';
    if (err.response?.status === 401 && !url.includes('/auth/login')) {
      localStorage.removeItem('qf_token');
      window.dispatchEvent(new Event('qf:session-expired'));
    }
    return Promise.reject(err);
  }
);

export const errMsg = (e) => e.response?.data?.message || (e.request ? 'Cannot reach the server. Check your connection.' : e.message);

export const authApi = {
  register: (b) => api.post('/auth/register', b).then((r) => r.data.data),
  login: (b) => api.post('/auth/login', b).then((r) => r.data.data),
  me: () => api.get('/auth/me').then((r) => r.data.data),
};
export const queueApi = {
  list: () => api.get('/queues').then((r) => r.data.data.queues),
  create: (name) => api.post('/queues', { name }).then((r) => r.data.data.queue),
  rename: (id, name) => api.put(`/queues/${id}`, { name }).then((r) => r.data.data.queue),
  remove: (id) => api.delete(`/queues/${id}`),
};
export const tokenApi = {
  list: (qid) => api.get(`/queues/${qid}/tokens`).then((r) => r.data.data),
  add: (qid, personName) => api.post(`/queues/${qid}/tokens`, { personName }).then((r) => r.data.data.token),
  move: (qid, tid, direction) => api.patch(`/queues/${qid}/tokens/${tid}/move`, { direction }).then((r) => r.data.data),
  serve: (qid) => api.patch(`/queues/${qid}/serve`).then((r) => r.data.data),
  cancel: (qid, tid) => api.patch(`/queues/${qid}/tokens/${tid}/cancel`).then((r) => r.data.data),
};
export const analyticsApi = {
  overview: () => api.get('/analytics/overview').then((r) => r.data.data),
  queues: () => api.get('/analytics/queues').then((r) => r.data.data.queues),
  trends: (days = 7) => api.get(`/analytics/trends?days=${days}`).then((r) => r.data.data.trends),
};
