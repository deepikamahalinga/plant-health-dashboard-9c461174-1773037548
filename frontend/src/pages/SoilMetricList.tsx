// SoilMetricList.tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import {
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Card,
  Title,
  Button,
  Badge,
  TextInput,
  Select,
  SelectItem,
} from '@tremor/react';
import { Dialog } from '@headlessui/react';
import { ChevronUpIcon, ChevronDownIcon, PlusIcon, SearchIcon } from '@heroicons/react/outline';

// Types (would typically be in separate files)
interface SoilMetric {
  id: string;
  timestamp: string;
  moisture: number;
  pH: number;
  temperature: number;
  location?: {
    id: string;
    name: string;
  };
}

interface SortConfig {
  field: keyof SoilMetric | '';
  direction: 'asc' | 'desc';
}

interface FilterConfig {
  search: string;
  field: keyof SoilMetric | '';
}

const PAGE_SIZES = [10, 25, 50, 100];

export default function SoilMetricList() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [sort, setSort] = useState<SortConfig>({ field: '', direction: 'asc' });
  const [filter, setFilter] = useState<FilterConfig>({ search: '', field: '' });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Fetch data using React Query
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['soilMetrics', page, pageSize, sort, filter],
    queryFn: () => fetchSoilMetrics({ page, pageSize, sort, filter }),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteSoilMetric,
    onSuccess: () => {
      refetch();
      setDeleteId(null);
    },
  });

  if (isLoading) {
    return (
      <Card className="mt-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded" />
          ))}
        </div>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="mt-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">Error loading data</h3>
          <p className="mt-2 text-gray-500">{error?.message}</p>
          <Button onClick={() => refetch()} className="mt-4">
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <Title>Soil Metrics</Title>
        <Button
          icon={PlusIcon}
          onClick={() => router.push('/soil-metrics/new')}
        >
          New Measurement
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex gap-4 flex-wrap">
          <TextInput
            icon={SearchIcon}
            placeholder="Search..."
            value={filter.search}
            onChange={(e) => setFilter(f => ({ ...f, search: e.target.value }))}
          />
          <Select
            value={filter.field}
            onValueChange={(value) => setFilter(f => ({ ...f, field: value as keyof SoilMetric }))}
          >
            <SelectItem value="">All Fields</SelectItem>
            <SelectItem value="moisture">Moisture</SelectItem>
            <SelectItem value="pH">pH</SelectItem>
            <SelectItem value="temperature">Temperature</SelectItem>
          </Select>
        </div>
      </Card>

      {/* Table */}
      <Card>
        {data?.items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No soil metrics found</p>
          </div>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell 
                  onClick={() => setSort({ 
                    field: 'timestamp',
                    direction: sort.field === 'timestamp' && sort.direction === 'asc' ? 'desc' : 'asc'
                  })}
                  className="cursor-pointer"
                >
                  Timestamp
                  {sort.field === 'timestamp' && (
                    sort.direction === 'asc' ? <ChevronUpIcon className="w-4 h-4 inline" /> : 
                    <ChevronDownIcon className="w-4 h-4 inline" />
                  )}
                </TableHeaderCell>
                <TableHeaderCell>Moisture (%)</TableHeaderCell>
                <TableHeaderCell>pH</TableHeaderCell>
                <TableHeaderCell>Temperature (°C)</TableHeaderCell>
                <TableHeaderCell>Location</TableHeaderCell>
                <TableHeaderCell>Actions</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.items.map((metric) => (
                <TableRow key={metric.id}>
                  <TableCell>{new Date(metric.timestamp).toLocaleString()}</TableCell>
                  <TableCell>{metric.moisture.toFixed(2)}</TableCell>
                  <TableCell>{metric.pH.toFixed(2)}</TableCell>
                  <TableCell>{metric.temperature.toFixed(2)}</TableCell>
                  <TableCell>{metric.location?.name ?? '-'}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="xs"
                        variant="secondary"
                        onClick={() => router.push(`/soil-metrics/${metric.id}`)}
                      >
                        View
                      </Button>
                      <Button
                        size="xs"
                        variant="secondary"
                        onClick={() => router.push(`/soil-metrics/${metric.id}/edit`)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="xs"
                        variant="secondary"
                        color="red"
                        onClick={() => setDeleteId(metric.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => setPageSize(Number(value))}
          >
            {PAGE_SIZES.map(size => (
              <SelectItem key={size} value={size.toString()}>
                {size} per page
              </SelectItem>
            ))}
          </Select>
          
          <div className="flex gap-2">
            <Button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              Previous
            </Button>
            <Button
              disabled={!data?.hasMore}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-lg p-6 max-w-sm">
            <Dialog.Title className="text-lg font-medium">
              Confirm Delete
            </Dialog.Title>
            <Dialog.Description className="mt-2">
              Are you sure you want to delete this measurement? This action cannot be undone.
            </Dialog.Description>
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setDeleteId(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                color="red"
                onClick={() => {
                  if (deleteId) {
                    deleteMutation.mutate(deleteId);
                  }
                }}
                loading={deleteMutation.isLoading}
              >
                Delete
              </Button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}