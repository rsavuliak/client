import axios from 'axios';

const api = axios.create({
  baseURL: 'https://auth.savuliak.com/api/v1',
  //baseURL: 'http://localhost:8080/api/v1',
  withCredentials: true
});

export { api as default };
