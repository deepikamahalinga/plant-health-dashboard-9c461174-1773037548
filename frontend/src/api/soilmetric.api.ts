// soilmetric.api.ts
import axios, { AxiosError, AxiosInstance } from 'axios';

// Types
export interface SoilMetric {
  id: string;
  timestamp: string;
  moisture: number;
  pH: number;
  temperature: number;
  locationId?: string;
}

export interface SoilMetricCreate extends Omit<SoilMetric, 'id'> {}
export interface SoilMetricUpdate extends Partial<SoilMetricCreate> {}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SortParams {
  field: keyof SoilMetric;
  direction: 'asc' | 'desc';
}

export interface FilterParams {
  startDate?: string;
  endDate?: string;
  locationId?: string;
  minMoisture?: number;
  maxMoisture?: number;
  minPH?: number;
  maxPH?: number;
  minTemperature?: number;
  maxTemperature?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// API Client
export class SoilMetricApi {
  private client: AxiosInstance;
  private static RETRY_ATTEMPTS = 3;
  private static RETRY_DELAY = 1000;

  constructor() {
    const baseURL = process.env.VITE_API_URL || process.env.NEXT_PUBLIC_API_URL;
    if (!baseURL) throw new Error('API base URL not configured');

    this.client = axios.create({
      baseURL: `${baseURL}/api/soilmetrics`,
      timeout: 10000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config!;
        
        // Retry logic for network errors or 5xx responses
        if (
          (error.response?.status === 500 || error.code === 'ECONNABORTED') &&
          (originalRequest as any)._retry < this.RETRY_ATTEMPTS
        ) {
          (originalRequest as any)._retry = ((originalRequest as any)._retry || 0) + 1;
          await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY));
          return this.client(originalRequest);
        }

        throw new ApiError(
          error.response?.status || 500,
          error.response?.data?.message || 'An unexpected error occurred',
          error.response?.data?.code,
          error.response?.data?.details
        );
      }
    );
  }

  async getAllSoilMetrics(
    filters?: FilterParams,
    pagination?: PaginationParams,
    sort?: SortParams
  ): Promise<PaginatedResponse<SoilMetric>> {
    const { data } = await this.client.get('', {
      params: {
        ...filters,
        ...pagination,
        ...sort,
      },
    });
    return data;
  }

  async getSoilMetricById(id: string): Promise<SoilMetric> {
    const { data } = await this.client.get(`/${id}`);
    return data;
  }

  async createSoilMetric(soilMetric: SoilMetricCreate): Promise<SoilMetric> {
    const { data } = await this.client.post('', soilMetric);
    return data;
  }

  async updateSoilMetric(
    id: string,
    soilMetric: SoilMetricUpdate
  ): Promise<SoilMetric> {
    const { data } = await this.client.put(`/${id}`, soilMetric);
    return data;
  }

  async deleteSoilMetric(id: string): Promise<void> {
    await this.client.delete(`/${id}`);
  }
}

// Export singleton instance
export const soilMetricApi = new SoilMetricApi();