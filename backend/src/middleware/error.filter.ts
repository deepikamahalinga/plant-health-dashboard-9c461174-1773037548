// types/error.types.ts
export interface ErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
  path: string;
  details?: any;
}

// filters/all-exceptions.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Request } from 'express';
import { ErrorResponse } from '../types/error.types';
import { Logger } from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const isProduction = process.env.NODE_ENV === 'production';

    let statusCode: number;
    let message: string;
    let error: string;
    let details: any;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const response = exception.getResponse();
      message = typeof response === 'string' ? response : (response as any).message;
      error = exception.name;
      details = typeof response === 'object' ? response : undefined;
    } else if (exception instanceof Error) {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      message = isProduction ? 'Internal server error' : exception.message;
      error = exception.name;
      this.logger.error(
        `${exception.message} ${exception.stack}`,
        exception.stack,
      );
    } else {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      message = isProduction ? 'Internal server error' : String(exception);
      error = 'UnknownError';
    }

    const errorResponse: ErrorResponse = {
      statusCode,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(details && !isProduction && { details }),
    };

    // Log error details
    this.logger.error(
      `${request.method} ${request.url} - Status ${statusCode} - ${message}`,
      isProduction ? undefined : exception,
    );

    httpAdapter.reply(ctx.getResponse(), errorResponse, statusCode);
  }
}

// exceptions/custom-exceptions.ts
import { HttpException, HttpStatus } from '@nestjs/common';

export class ResourceNotFoundException extends HttpException {
  constructor(resource: string) {
    super(
      {
        message: `${resource} not found`,
        error: 'Not Found',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class ValidationFailedException extends HttpException {
  constructor(errors: any[]) {
    super(
      {
        message: 'Validation failed',
        error: 'Bad Request',
        details: errors,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message: string = 'Unauthorized access') {
    super(
      {
        message,
        error: 'Unauthorized',
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}

// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { HttpAdapterHost } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const httpAdapter = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));
  
  await app.listen(3000);
}
bootstrap();