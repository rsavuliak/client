import api from './api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  provider: string;
}

export const authService = {
  login: (data: LoginRequest) => api.post('/auth/login', data),
  
  register: (data: RegisterRequest) => api.post('/auth/register', data),
  
  logout: () => api.post('/auth/logout'),
  
  refresh: () => api.post('/auth/refresh'),
  
  me: () => api.get<User>('/auth/me'),
  
  deleteAccount: () => api.delete('/auth/delete'),
  
  googleLogin: () => {
    const GOOGLE_CLIENT_ID = '424121716950-g87ltpn5f3q6q4gl169frn9fp046i7rd.apps.googleusercontent.com';
    const REDIRECT_URI = 'https://auth.savuliak.com/api/v1/auth/oauth/google';
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', 'openid email profile');
    authUrl.searchParams.set('access_type', 'offline');
    
    window.location.href = authUrl.toString();
  }
};