import axios from 'axios';
import api from './api';
import { attachRefreshInterceptor } from './refreshInterceptor';

const todoApi = axios.create({
  baseURL: 'https://todo.savuliak.com/api/v1',
  withCredentials: true,
});

attachRefreshInterceptor(todoApi, api);

export { todoApi as default };
