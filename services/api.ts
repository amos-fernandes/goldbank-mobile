import axios from 'axios';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let authTokenGetter: (() => string | null) | null = null;

export const setAuthTokenGetter = (getter: (() => string | null) | null) => {
  authTokenGetter = getter;
};

api.interceptors.request.use((config) => {
  if (authTokenGetter) {
    const token = authTokenGetter();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});
