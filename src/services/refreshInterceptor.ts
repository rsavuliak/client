import type { AxiosInstance } from 'axios';
import { useAuthStore } from './useAuthStore';

let isRefreshing = false;
let queue: Array<() => void> = [];

function flushQueue() {
  const pending = queue.slice();
  queue = [];
  pending.forEach((cb) => cb());
}

function clearQueue() {
  queue = [];
}

export function attachRefreshInterceptor(instance: AxiosInstance, refreshInstance: AxiosInstance) {
  instance.interceptors.response.use(
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
        const ownOriginal = original;
        return new Promise((resolve, reject) => {
          queue.push(() => instance(ownOriginal).then(resolve).catch(reject));
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        await refreshInstance.post('/auth/refresh');
        flushQueue();
        return instance(original);
      } catch (refreshError) {
        clearQueue();
        useAuthStore.getState().clearUser();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
  );
}
