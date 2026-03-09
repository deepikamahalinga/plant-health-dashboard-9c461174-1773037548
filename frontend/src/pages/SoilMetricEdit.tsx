import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { format } from 'date-fns';
import { SoilMetric } from '../types/SoilMetric';
import { getSoilMetric, updateSoilMetric } from '../api/soilMetrics';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';

const soilMetricSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().refine(val => !isNaN(Date.parse(val)) && new Date(val) <= new Date(), {
    message: "Timestamp cannot be in the future"
  }),
  moisture: z.number().min(0).max(100),
  pH: z.number().min(0).max(14),
  temperature: z.number().min(-50).max(100)
});

type ValidationErrors = {
  [K in keyof z.infer<typeof soilMetricSchema>]?: string[];
};

export default function SoilMetricEdit() {
  const { id } = useParams<{id: string}>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  
  const [formData, setFormData] = useState<SoilMetric>({
    id: '',
    timestamp: '',
    moisture: 0,
    pH: 0,
    temperature: 0
  });
  
  const [originalData, setOriginalData] = useState<SoilMetric | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;
        const data = await getSoilMetric(id);
        if (!data) {
          setError('Soil metric not found');
          return;
        }
        setFormData(data);
        setOriginalData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading soil metric');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'timestamp' ? value : Number(value)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    setError(null);

    try {
      const validated = soilMetricSchema.parse(formData);
      setSubmitting(true);
      await updateSoilMetric(validated);
      navigate(`/soil-metrics/${id}`);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setValidationErrors(err.flatten().fieldErrors);
      } else {
        setError(err instanceof Error ? err.message : 'Error updating soil metric');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    if (originalData) {
      setFormData(originalData);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Edit Soil Metric</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Timestamp
            <input
              type="datetime-local"
              name="timestamp"
              value={format(new Date(formData.timestamp), "yyyy-MM-dd'T'HH:mm")}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              disabled={submitting}
            />
          </label>
          {validationErrors.timestamp?.map(error => (
            <p key={error} className="mt-1 text-sm text-red-600">{error}</p>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Moisture (%)
            <input
              type="number"
              name="moisture"
              value={formData.moisture}
              onChange={handleChange}
              min="0"
              max="100"
              step="0.1"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              disabled={submitting}
            />
          </label>
          {validationErrors.moisture?.map(error => (
            <p key={error} className="mt-1 text-sm text-red-600">{error}</p>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            pH Level
            <input
              type="number"
              name="pH"
              value={formData.pH}
              onChange={handleChange}
              min="0"
              max="14"
              step="0.1"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              disabled={submitting}
            />
          </label>
          {validationErrors.pH?.map(error => (
            <p key={error} className="mt-1 text-sm text-red-600">{error}</p>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Temperature (°C)
            <input
              type="number"
              name="temperature"
              value={formData.temperature}
              onChange={handleChange}
              min="-50"
              max="100"
              step="0.1"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              disabled={submitting}
            />
          </label>
          {validationErrors.temperature?.map(error => (
            <p key={error} className="mt-1 text-sm text-red-600">{error}</p>
          ))}
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {submitting ? 'Updating...' : 'Update'}
          </button>
          
          <button
            type="button"
            onClick={handleReset}
            disabled={submitting}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Reset
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}