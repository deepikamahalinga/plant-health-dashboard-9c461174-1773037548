import { z } from 'zod';

export const UpdateSoilMetricDto = z.object({
  timestamp: z
    .date()
    .max(new Date(), 'Timestamp cannot be in the future')
    .optional(),

  moisture: z
    .number()
    .min(0, 'Moisture must be between 0 and 100')
    .max(100, 'Moisture must be between 0 and 100')
    .optional(),

  pH: z
    .number()
    .min(0, 'pH must be between 0 and 14') 
    .max(14, 'pH must be between 0 and 14')
    .optional(),

  temperature: z
    .number()
    .min(-50, 'Temperature must be between -50°C and 100°C')
    .max(100, 'Temperature must be between -50°C and 100°C')
    .optional(),
});

export type UpdateSoilMetricDto = z.infer<typeof UpdateSoilMetricDto>;