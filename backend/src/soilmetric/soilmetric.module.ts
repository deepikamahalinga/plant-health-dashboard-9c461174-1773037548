// soil-metric.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SoilMetricController } from './soil-metric.controller';
import { SoilMetricService } from './soil-metric.service';
import { SoilMetric } from './entities/soil-metric.entity';
import { LocationModule } from '../location/location.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SoilMetric]),
    LocationModule, // Import LocationModule for relationship
  ],
  controllers: [SoilMetricController],
  providers: [
    SoilMetricService,
  ],
  exports: [SoilMetricService], // Export service for use in other modules
})
export class SoilMetricModule {}