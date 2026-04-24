import axios from 'axios';
import api from './api';
import { attachRefreshInterceptor } from './refreshInterceptor';

const userApi = axios.create({
  baseURL: 'https://users.savuliak.com/api/v1/users',
  // baseURL: 'http://localhost:8081/api/v1/users',
  withCredentials: true,
});

// uses the auth api instance to call /auth/refresh on 401
attachRefreshInterceptor(userApi, api);

export { userApi as default };
