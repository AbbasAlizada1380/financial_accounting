import axios from 'axios';

// 1. یک متغیر محلی برای نگهداری store ایجاد می‌کنیم.
let store;

// 2. یک تابع برای تزریق store از بیرون ایجاد و export می‌کنیم.
export const injectStore = (_store) => {
  store = _store;
};

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    // 3. حالا از متغیر محلی store استفاده می‌کنیم.
    if (store) {
      const token = store.getState().user.accessToken;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      if (store) {
        store.dispatch({ type: 'user/logout' });
      }
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;