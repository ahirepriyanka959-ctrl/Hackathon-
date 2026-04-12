import axios from 'axios';
import { API_BASE_URL } from '../config/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // Optionally trigger logout
    }
    const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Unknown network error';
    return Promise.reject(new Error(errorMessage));
  }
);
