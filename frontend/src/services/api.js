import axios from 'axios';

// Create Axios client with base backend API URL configuration
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach JWT token to headers of all outgoing requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
  
  let baseUrl = import.meta.env.VITE_IMAGE_BASE_URL;
  if (!baseUrl && import.meta.env.VITE_API_URL) {
    baseUrl = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '');
  }
  if (!baseUrl) {
    baseUrl = 'http://localhost:5000';
  }
  return `${baseUrl}${imagePath}`;
};

export default API;
