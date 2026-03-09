import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, SoilMetric } from '@prisma/client';

// Custom types for the service
export type CreateSoilMetricDto = {
  moisture: number;
  pH: number;
  temperature: number;
  locationId: string;
  timestamp?: Date;
};

export type UpdateSoilMetricDto = Partial<CreateSoilMetricDto>;

export type SoilMetricFilters = {
  startDate?: Date;
  endDate?: Date;
  locationId?: string;
};

export type PaginationParams = {
  skip?: number;
  take?: number;
};

@Injectable()
export class SoilMetricService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    filters?: SoilMetricFilters,
    pagination?: PaginationParams,
  ): Promise<SoilMetric[]> {
    const where: Prisma.SoilMetricWhereInput = {};

    if (filters?.locationId) {
      where.locationId = filters.locationId;
    }

    if (filters?.startDate || filters?.endDate) {
      where.timestamp = {
        gte: filters?.startDate,
        lte: filters?.endDate,
      };
    }

    return this.prisma.soilMetric.findMany({
      where,
      skip: pagination?.skip,
      take: pagination?.take,
      include: {
        location: true,
      },
      orderBy: {
        timestamp: 'desc',
      },
    });
  }

  async findById(id: string): Promise<SoilMetric> {
    const soilMetric = await this.prisma.soilMetric.findUnique({
      where: { id },
      include: {
        location: true,
      },
    });

    if (!soilMetric) {
      throw new NotFoundException(`Soil metric with ID ${id} not found`);
    }

    return soilMetric;
  }

  async create(data: CreateSoilMetricDto): Promise<SoilMetric> {
    return this.prisma.soilMetric.create({
      data: {
        ...data,
        timestamp: data.timestamp || new Date(),
        id: undefined, // Let Prisma handle UUID generation
      },
      include: {
        location: true,
      },
    });
  }

  async update(id: string, data: UpdateSoilMetricDto): Promise<SoilMetric> {
    try {
      return await this.prisma.soilMetric.update({
        where: { id },
        data,
        include: {
          location: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Soil metric with ID ${id} not found`);
      }
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.soilMetric.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Soil metric with ID ${id} not found`);
      }
      throw error;
    }
  }

  // Additional utility methods for access patterns

  async getLatestByLocation(locationId: string): Promise<SoilMetric | null> {
    return this.prisma.soilMetric.findFirst({
      where: { locationId },
      orderBy: { timestamp: 'desc' },
      include: { location: true },
    });
  }

  async getAggregatedMetrics(
    locationId: string,
    startDate: Date,
    endDate: Date,
  ) {
    return this.prisma.soilMetric.aggregate({
      where: {
        locationId,
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      _avg: {
        moisture: true,
        pH: true,
        temperature: true,
      },
      _min: {
        moisture: true,
        pH: true,
        temperature: true,
      },
      _max: {
        moisture: true,
        pH: true,
        temperature: true,
      },
    });
  }
}