import { z } from 'zod';

/**
 * Schema for creating a new soil metric measurement
 */
export const CreateSoilMetricSchema = z.object({
  /**
   * Timestamp when the measurement was taken
   * Must not be a future date
   */
  timestamp: z
    .date()
    .max(new Date(), { message: 'Timestamp cannot be in the future' }),

  /**
   * Soil moisture percentage
   * Range: 0-100%
   */
  moisture: z
    .number()
    .min(0, { message: 'Moisture cannot be less than 0%' })
    .max(100, { message: 'Moisture cannot be more than 100%' })
    .multipleOf(0.01),

  /**
   * Soil pH level
   * Range: 0-14
   */
  pH: z
    .number()
    .min(0, { message: 'pH cannot be less than 0' })
    .max(14, { message: 'pH cannot be more than 14' })
    .multipleOf(0.1),

  /**
   * Soil temperature in Celsius
   * Range: -50°C to 100°C
   */
  temperature: z
    .number()
    .min(-50, { message: 'Temperature cannot be less than -50°C' })
    .max(100, { message: 'Temperature cannot be more than 100°C' })
    .multipleOf(0.1),
});

/**
 * Type definition for creating a soil metric measurement
 */
export type CreateSoilMetricDto = z.infer<typeof CreateSoilMetricSchema>;