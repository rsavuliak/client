import axios from 'axios';

const userApi = axios.create({
  baseURL: 'https://users.savuliak.com/api/v1/users',
  // baseURL: 'http://localhost:8081/api/v1/users',
  withCredentials: true
});

export { userApi as default };
