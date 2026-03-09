// src/health/types/health.types.ts
export interface HealthCheckResponse {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  memoryUsage: {
    heapUsed: number;
    heapTotal: number;
    rss: number;
    external: number;
  };
  database: {
    status: 'up' | 'down';
    responseTime: number;
  };
}

// src/health/health.controller.ts
import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { 
  HealthCheck, 
  HealthCheckService, 
  TypeOrmHealthIndicator 
} from '@nestjs/terminus';
import { HealthCheckResponse } from './types/health.types';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    @InjectConnection() private readonly connection: Connection
  ) {}

  @Get()
  @HealthCheck()
  async check(): Promise<HealthCheckResponse> {
    try {
      // Check database connection
      const dbStart = Date.now();
      await this.connection.query('SELECT 1');
      const dbResponseTime = Date.now() - dbStart;

      // Get memory usage
      const memoryUsage = process.memoryUsage();

      const healthData: HealthCheckResponse = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memoryUsage: {
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
          rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
          external: Math.round(memoryUsage.external / 1024 / 1024), // MB
        },
        database: {
          status: 'up',
          responseTime: dbResponseTime,
        },
      };

      return healthData;
    } catch (error) {
      const errorResponse: HealthCheckResponse = {
        status: 'error',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memoryUsage: {
          heapUsed: 0,
          heapTotal: 0,
          rss: 0,
          external: 0,
        },
        database: {
          status: 'down',
          responseTime: 0,
        },
      };

      throw new ServiceUnavailableException(errorResponse);
    }
  }
}

// src/health/health.module.ts
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
})
export class HealthModule {}