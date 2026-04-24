import axios from 'axios';
import { attachRefreshInterceptor } from './refreshInterceptor';

const api = axios.create({
  baseURL: 'https://auth.savuliak.com/api/v1',
  //baseURL: 'http://localhost:8080/api/v1',
  withCredentials: true,
});

attachRefreshInterceptor(api, api);

export { api as default };
