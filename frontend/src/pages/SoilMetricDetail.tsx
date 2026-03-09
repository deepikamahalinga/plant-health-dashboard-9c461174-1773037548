import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Title, Text, Badge, Button, Metric } from '@tremor/react';
import { ExclamationCircleIcon } from '@heroicons/react/outline';
import { format } from 'date-fns';
import { Dialog } from '@headlessui/react';

import { SoilMetric, Location } from '../types';
import { getSoilMetric, getLocation, deleteSoilMetric } from '../api/soilMetrics';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorAlert } from '../components/ErrorAlert';

export const SoilMetricDetail: React.FC = () => {
  const { id } = useParams<{id: string}>();
  const navigate = useNavigate();
  
  const [metric, setMetric] = useState<SoilMetric | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!id) return;

      const metricData = await getSoilMetric(id);
      setMetric(metricData);

      if (metricData.locationId) {
        const locationData = await getLocation(metricData.locationId);
        setLocation(locationData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      if (!id) return;
      await deleteSoilMetric(id);
      navigate('/soil-metrics');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorAlert 
        message={error}
        onRetry={loadData}
      />
    );
  }

  if (!metric) {
    return (
      <div className="text-center py-12">
        <ExclamationCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Soil Metric Not Found</h3>
        <div className="mt-6">
          <Button onClick={() => navigate('/soil-metrics')}>
            Back to List
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-4">
            <li>
              <button 
                onClick={() => navigate('/soil-metrics')}
                className="text-gray-400 hover:text-gray-500"
              >
                Soil Metrics
              </button>
            </li>
            <li className="text-gray-500">/</li>
            <li className="text-gray-500 truncate">{metric.id}</li>
          </ol>
        </nav>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-6">
        <Card>
          <div className="flex justify-between items-start mb-6">
            <div>
              <Title>Soil Metric Details</Title>
              <Text>{format(new Date(metric.timestamp), 'PPpp')}</Text>
            </div>
            <div className="flex space-x-4">
              <Button
                variant="secondary"
                onClick={() => navigate(`/soil-metrics/${id}/edit`)}
              >
                Edit
              </Button>
              <Button
                color="red"
                onClick={() => setShowDeleteDialog(true)}
              >
                Delete
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card decoration="top" decorationColor="blue">
              <Text>Moisture</Text>
              <Metric>{metric.moisture}%</Metric>
            </Card>

            <Card decoration="top" decorationColor="green">
              <Text>pH Level</Text>
              <Metric>{metric.pH.toFixed(1)}</Metric>
            </Card>

            <Card decoration="top" decorationColor="orange">
              <Text>Temperature</Text>
              <Metric>{metric.temperature}°C</Metric>
            </Card>
          </div>

          {location && (
            <div className="mt-6">
              <Title className="mb-2">Location</Title>
              <Card>
                <Text>{location.name}</Text>
                {location.coordinates && (
                  <Text className="text-gray-500">
                    Coordinates: {location.coordinates}
                  </Text>
                )}
              </Card>
            </div>
          )}
        </Card>
      </div>

      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-lg p-6 max-w-sm">
            <Dialog.Title className="text-lg font-medium mb-4">
              Confirm Delete
            </Dialog.Title>
            <Dialog.Description className="mb-6">
              Are you sure you want to delete this soil metric? This action cannot be undone.
            </Dialog.Description>

            <div className="flex justify-end space-x-4">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancel
              </Button>
              <Button
                color="red"
                onClick={handleDelete}
              >
                Delete
              </Button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default SoilMetricDetail;