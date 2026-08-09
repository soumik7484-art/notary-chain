import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? '/api'
    : 'https://server-lovat-gamma-13.vercel.app/api');

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (typeof window !== 'undefined') {
    config.headers['X-Screen-Resolution'] = `${window.screen.width}x${window.screen.height}`;
  }
  return config;
}, (error) => Promise.reject(error));

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refresh = localStorage.getItem('refreshToken');
        if (refresh) {
          const { data } = await axios.post(`${API_BASE_URL}/auth/refresh-token`, { token: refresh });
          if (data.accessToken) {
            localStorage.setItem('accessToken', data.accessToken);
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
            return axiosInstance(originalRequest);
          }
        }
      } catch (err) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
