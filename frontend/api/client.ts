import axios from 'axios';
import { Platform } from 'react-native';

import { storage } from '@/utils/storage';

const DEFAULT_REMOTE_API_URL = 'https://5354390969eb.ngrok-free.app';

const getApiUrl = () => {
  const envApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (envApiUrl) {
    return envApiUrl.replace(/\/$/, '');
  }

  if (__DEV__) {
    if (Platform.OS === 'web') {
      return 'http://localhost:8000';
    }
    return DEFAULT_REMOTE_API_URL;
  }

  return DEFAULT_REMOTE_API_URL;
};

const API_URL = getApiUrl();

console.log('🌐 API URL:', API_URL, 'Platform:', Platform.OS);

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

// Request interceptor - добавляем токен к каждому запросу
apiClient.interceptors.request.use(
  async (config) => {
    const token = await storage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - обработка ошибок
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Токен невалиден - очищаем его
      await storage.deleteItem('access_token');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
