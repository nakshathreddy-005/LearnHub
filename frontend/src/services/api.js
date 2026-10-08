import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
});

export const msg = (e) => e.response?.data?.message || 'Something went wrong. Please try again.';
export default api;
export const fe = (e) => e.response?.data?.errors || {};
