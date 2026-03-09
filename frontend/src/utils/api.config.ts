// api.config.ts

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

// Types
interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

interface ApiRequestConfig extends AxiosRequestConfig {
  retry?: boolean;
}

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config: ApiRequestConfig): ApiRequestConfig => {
    const token = localStorage.getItem('auth_token');
    
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    
    return config;
  },
  (error: AxiosError): Promise<AxiosError> => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    return response;
  },
  async (error: AxiosError): Promise<any> => {
    const originalRequest = error.config as ApiRequestConfig;

    // Handle unauthorized errors
    if (error.response?.status === 401 && !originalRequest?.retry) {
      originalRequest.retry = true;
      
      try {
        // Attempt to refresh token
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post('/auth/refresh', { token: refreshToken });
        
        if (response.data.token) {
          localStorage.setItem('auth_token', response.data.token);
          originalRequest.headers!.Authorization = `Bearer ${response.data.token}`;
          return api(originalRequest);
        }
      } catch (error) {
        // Handle refresh token failure
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }

    // Format error response
    const error_response: ApiError = {
      message: error.response?.data?.message || 'An unexpected error occurred',
      code: error.response?.data?.code,
      status: error.response?.status
    };

    return Promise.reject(error_response);
  }
);

export default api;
export type { ApiError, ApiRequestConfig };