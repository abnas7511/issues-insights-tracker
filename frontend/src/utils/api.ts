// src/utils/api.ts
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

let jwt: string | null = null;

export function setToken(token: string) {
  jwt = token;
}

export function clearToken() {
  jwt = null;
}

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  if (jwt) {
    config.headers['Authorization'] = `Bearer ${jwt}`;
  }
  return config;
});

export async function login(email: string, password: string) {
  const res = await api.post('/auth/login', { email, password });
  return res.data;
}

export async function register(email: string, password: string, name: string, role?: string) {
  const payload: any = { email, password, name };
  if (role) payload.role = role;
  const res = await api.post('/auth/register', payload);
  return res.data;
}

export async function refreshToken(refreshToken: string) {
  const res = await api.post('/auth/refresh', { refresh_token: refreshToken });
  return res.data;
}

export async function getUser(userId: string) {
  const res = await api.get(`/users/${userId}`);
  return res.data;
}

export async function getCurrentUser() {
  const res = await api.get('/users/me');
  return res.data;
}

export default api;
