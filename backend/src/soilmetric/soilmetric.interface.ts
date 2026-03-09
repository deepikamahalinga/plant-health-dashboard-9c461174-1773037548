import { z } from 'zod';

/**
 * Represents a location where soil measurements are taken
 */
export interface Location {
  id: string;
  // other location fields
}

/**
 * Represents soil health measurements from calibrated sensors
 * @property id - Unique identifier for the measurement
 * @property timestamp - When the measurement was taken
 * @property moisture - Soil moisture percentage (0-100)
 * @property pH - Soil pH level (0-14)
 * @property temperature - Soil temperature in Celsius (-50 to 100)
 * @property locationId - Reference to measurement location
 */
export interface SoilMetric {
  id: string;
  timestamp: Date;
  moisture: number;
  pH: number;
  temperature: number;
  locationId: string;
  location?: Location;
}

/**
 * Partial type for updating existing soil metrics
 */
export type SoilMetricUpdate = Partial<Omit<SoilMetric, 'id' | 'timestamp'>>;

/**
 * Type for creating new soil metrics
 */
export type CreateSoilMetric = Omit<SoilMetric, 'id'>;

/**
 * Validation schema for soil metrics
 */
export const soilMetricSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.date().max(new Date(), 'Timestamp cannot be in the future'),
  moisture: z.number()
    .min(0, 'Moisture must be between 0 and 100')
    .max(100, 'Moisture must be between 0 and 100'),
  pH: z.number()
    .min(0, 'pH must be between 0 and 14')
    .max(14, 'pH must be between 0 and 14'),
  temperature: z.number()
    .min(-50, 'Temperature must be between -50°C and 100°C')
    .max(100, 'Temperature must be between -50°C and 100°C'),
  locationId: z.string().uuid()
});

/**
 * Validation schema for updating soil metrics
 */
export const soilMetricUpdateSchema = soilMetricSchema.partial().omit({ 
  id: true,
  timestamp: true 
});

/**
 * Validation schema for creating soil metrics
 */
export const createSoilMetricSchema = soilMetricSchema.omit({ id: true });

/**
 * Type for querying soil metrics by time range
 */
export interface SoilMetricTimeQuery {
  startDate: Date;
  endDate: Date;
  locationId?: string;
}

/**
 * Type for aggregated soil metrics
 */
export interface AggregatedSoilMetric {
  timestamp: Date;
  avgMoisture: number;
  avgPH: number;
  avgTemperature: number;
  locationId: string;
}