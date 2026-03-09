import { useState } from 'react';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

// Types (would normally be imported)
type SoilMetric = {
  id: string;
  timestamp: string;
  moisture: number;
  pH: number;
  temperature: number;
  locationId: string; // For relationship
};

// Validation schema
const soilMetricSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime().refine(val => new Date(val) <= new Date(), {
    message: "Timestamp cannot be in the future"
  }),
  moisture: z.number().min(0).max(100),
  pH: z.number().min(0).max(14),
  temperature: z.number().min(-50).max(100),
  locationId: z.string().uuid()
});

export default function SoilMetricCreate() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<SoilMetric>({
    id: uuidv4(),
    timestamp: new Date().toISOString().slice(0, 16), // Format for datetime-local
    moisture: 0,
    pH: 7,
    temperature: 20,
    locationId: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['moisture', 'pH', 'temperature'].includes(name) 
        ? parseFloat(value) 
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Validate form data
      const validatedData = soilMetricSchema.parse(formData);

      // Would normally call API here
      // await createSoilMetric(validatedData);

      navigate('/soil-metrics'); // Redirect to list view
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">New Soil Measurement</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Timestamp
            </label>
            <input
              type="datetime-local"
              name="timestamp"
              value={formData.timestamp}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Moisture (%)
            </label>
            <input
              type="number"
              name="moisture"
              value={formData.moisture}
              onChange={handleChange}
              required
              min="0"
              max="100"
              step="0.1"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              pH Level
            </label>
            <input
              type="number"
              name="pH"
              value={formData.pH}
              onChange={handleChange}
              required
              min="0"
              max="14"
              step="0.1"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Temperature (°C)
            </label>
            <input
              type="number"
              name="temperature"
              value={formData.temperature}
              onChange={handleChange}
              required
              min="-50"
              max="100"
              step="0.1"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <select
              name="locationId"
              value={formData.locationId}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select a location...</option>
              {/* Location options would be populated from API */}
            </select>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Measurement'}
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/soil-metrics')}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}