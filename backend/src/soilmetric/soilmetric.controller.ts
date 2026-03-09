import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SoilMetricService } from './soil-metric.service';
import { CreateSoilMetricDto } from './dto/create-soil-metric.dto';
import { UpdateSoilMetricDto } from './dto/update-soil-metric.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('soil-metrics')
@Controller('soil-metrics')
@UseGuards(JwtAuthGuard)
export class SoilMetricController {
  constructor(private readonly soilMetricService: SoilMetricService) {}

  @Get()
  @ApiOperation({ summary: 'Get all soil metrics with pagination and filtering' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Returns paginated list of soil metrics' 
  })
  async getAllSoilMetrics(
    @Query() paginationQuery: PaginationQueryDto,
    @Query('locationId') locationId?: string,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
  ) {
    return this.soilMetricService.findAll(
      paginationQuery,
      locationId,
      startDate,
      endDate,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get soil metric by ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Returns a single soil metric' 
  })
  async getSoilMetricById(@Param('id', ParseUUIDPipe) id: string) {
    return this.soilMetricService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new soil metric' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Soil metric created successfully' 
  })
  async createSoilMetric(@Body() createSoilMetricDto: CreateSoilMetricDto) {
    return this.soilMetricService.create(createSoilMetricDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update soil metric by ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Soil metric updated successfully' 
  })
  async updateSoilMetric(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSoilMetricDto: UpdateSoilMetricDto,
  ) {
    return this.soilMetricService.update(id, updateSoilMetricDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete soil metric by ID' })
  @ApiResponse({ 
    status: HttpStatus.NO_CONTENT, 
    description: 'Soil metric deleted successfully' 
  })
  async deleteSoilMetric(@Param('id', ParseUUIDPipe) id: string) {
    await this.soilMetricService.delete(id);
    return { statusCode: HttpStatus.NO_CONTENT };
  }

  @Get('location/:locationId/latest')
  @ApiOperation({ summary: 'Get latest readings by location' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Returns latest soil metrics for location' 
  })
  async getLatestByLocation(
    @Param('locationId', ParseUUIDPipe) locationId: string,
  ) {
    return this.soilMetricService.getLatestByLocation(locationId);
  }

  @Get('aggregated')
  @ApiOperation({ summary: 'Get aggregated soil metrics' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Returns aggregated soil metrics' 
  })
  async getAggregatedMetrics(
    @Query('interval') interval: 'day' | 'week' | 'month',
    @Query('locationId') locationId?: string,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
  ) {
    return this.soilMetricService.getAggregated(
      interval,
      locationId,
      startDate,
      endDate,
    );
  }
}