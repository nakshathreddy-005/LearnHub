import axios from 'axios';
const api = axios.create({ baseURL: '/api', withCredentials: true });
export const msg = (e) => e.response?.data?.message || 'Something went wrong. Please try again.';
export default api;
export const fe = (e) => e.response?.data?.errors || {};
