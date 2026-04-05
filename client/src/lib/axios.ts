import axios from 'axios';

// Create axios instance WITHOUT baseURL — it will be set dynamically per-request
const api = axios.create({
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// REQUEST interceptor: sets baseURL at REQUEST TIME (when user clicks Login),
// not at module load time (which happens during Next.js static build on the server).
// This is the ONLY reliable way to detect the browser hostname in a statically
// generated Next.js page.
api.interceptors.request.use((config) => {
  // If we are in a browser and the hostname is NOT a local one, 
  // we MUST be in production.
  const isLocal = typeof window !== 'undefined' && 
                 (window.location.hostname === 'localhost' || 
                  window.location.hostname === '127.0.0.1');

  if (typeof window !== 'undefined' && !isLocal) {
    config.baseURL = 'https://apinutrizi.skalades.biz.id/api';
  } else {
    config.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
  }
  return config;
});

// Response interceptor for auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
