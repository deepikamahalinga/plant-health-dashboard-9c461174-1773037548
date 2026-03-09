// soilmetric.types.ts

import { z } from 'zod';

/**
 * Represents a location where soil measurements are taken
 */
export interface Location {
  id: string;
  name: string;
}

/**
 * Valid sort directions for queries
 */
export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc'
}

/**
 * Valid sort fields for soil metrics
 */
export enum SoilMetricSortField {
  TIMESTAMP = 'timestamp',
  MOISTURE = 'moisture',
  PH = 'ph',
  TEMPERATURE = 'temperature'
}

/**
 * Base interface for soil measurement data
 */
export interface SoilMetricBase {
  /** Soil moisture percentage (0-100) */
  moisture: number;
  
  /** Soil pH level (0-14) */
  pH: number;
  
  /** Soil temperature in Celsius (-50 to 100) */
  temperature: number;
  
  /** Reference to measurement location */
  locationId: string;
}

/**
 * Complete soil measurement entity with all fields
 */
export interface SoilMetric extends SoilMetricBase {
  /** Unique identifier */
  id: string;
  
  /** When measurement was taken */
  timestamp: Date;
  
  /** Associated location details */
  location?: Location;
  
  /** Record creation timestamp */
  createdAt: Date;
  
  /** Record last update timestamp */
  updatedAt: Date;
}

/**
 * DTO for creating new soil measurements
 */
export type CreateSoilMetricDto = Omit<SoilMetricBase, 'id' | 'createdAt' | 'updatedAt'> & {
  timestamp: Date;
};

/**
 * DTO for updating existing soil measurements
 */
export type UpdateSoilMetricDto = Partial<CreateSoilMetricDto>;

/**
 * Filter parameters for querying soil metrics
 */
export interface SoilMetricFilterParams {
  /** Filter by location ID */
  locationId?: string;
  
  /** Start of time range */
  startDate?: Date;
  
  /** End of time range */
  endDate?: Date;
  
  /** Minimum moisture value */
  minMoisture?: number;
  
  /** Maximum moisture value */
  maxMoisture?: number;
  
  /** Minimum pH value */
  minPH?: number;
  
  /** Maximum pH value */ 
  maxPH?: number;
  
  /** Minimum temperature value */
  minTemperature?: number;
  
  /** Maximum temperature value */
  maxTemperature?: number;
}

/**
 * Pagination parameters for list queries
 */
export interface PaginationParams {
  /** Page number (1-based) */
  page: number;
  
  /** Items per page */
  limit: number;
}

/**
 * Sort parameters for list queries
 */
export interface SortParams {
  /** Field to sort by */
  field: SoilMetricSortField;
  
  /** Sort direction */
  direction: SortDirection;
}

/**
 * Metadata included in list responses
 */
export interface ResponseMetadata {
  /** Total number of items */
  total: number;
  
  /** Current page number */
  page: number;
  
  /** Items per page */
  limit: number;
  
  /** Total number of pages */
  pageCount: number;
}

/**
 * API response wrapper for single items
 */
export interface SingleResponse<T> {
  data: T;
}

/**
 * API response wrapper for lists
 */
export interface ListResponse<T> {
  data: T[];
  metadata: ResponseMetadata;
}

/**
 * Zod validation schema for soil metrics
 */
export const soilMetricSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.date().max(new Date(), 'Cannot be a future date'),
  moisture: z.number().min(0).max(100),
  pH: z.number().min(0).max(14),
  temperature: z.number().min(-50).max(100),
  locationId: z.string().uuid()
});

/**
 * Zod validation schema for creating soil metrics
 */
export const createSoilMetricSchema = soilMetricSchema.omit({ 
  id: true,
  createdAt: true,
  updatedAt: true 
});

/**
 * Zod validation schema for updating soil metrics
 */
export const updateSoilMetricSchema = createSoilMetricSchema.partial();