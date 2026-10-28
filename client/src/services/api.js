import axios from 'axios';
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api', withCredentials: true });
api.interceptors.response.use((r) => r, (e) => {
  const url = e.config?.url || '';
  if (e.response?.status === 401 && !url.startsWith('/auth/')) window.location.assign('/login'); // expired session
  return Promise.reject(e);
});
export const errMsg = (e) => e.response?.data?.details?.map((d) => d.message).join(', ') || e.response?.data?.message || 'Something went wrong';
export default api;
