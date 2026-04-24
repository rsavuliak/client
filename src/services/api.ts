import axios from 'axios';
import { useAuthStore } from './useAuthStore';

const api = axios.create({
  baseURL: 'https://auth.savuliak.com/api/v1',
  //baseURL: 'http://localhost:8080/api/v1',
  withCredentials: true,
});

let isRefreshing = false;
let queue: Array<(retry: () => Promise<unknown>) => void> = [];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (
      error.response?.status !== 401 ||
      original._retry ||
      original.url?.includes('/auth/refresh')
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push((retry) => retry().then(resolve).catch(reject));
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      await api.post('/auth/refresh');
      const pending = queue.slice();
      queue = [];
      pending.forEach((cb) => cb(() => api(original)));
      return api(original);
    } catch (refreshError) {
      queue = [];
      useAuthStore.getState().clearUser();
      window.location.href = '/login';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export { api as default };
