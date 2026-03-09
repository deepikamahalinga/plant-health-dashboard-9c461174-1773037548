import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import * as compression from 'compression';
import { ZodValidationPipe } from 'nestjs-zod';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from './shared/services/prisma.service';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';
import { LoggingInterceptor } from './shared/interceptors/logging.interceptor';
import { TimeoutInterceptor } from './shared/interceptors/timeout.interceptor';
import { TransformInterceptor } from './shared/interceptors/transform.interceptor';
import { RateLimiterGuard } from './shared/guards/rate-limiter.guard';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
      cors: {
        origin: process.env.CORS_ORIGIN?.split(',') || '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
      },
    });

    const configService = app.get(ConfigService);
    const prismaService = app.get(PrismaService);

    // Enable shutdown hooks
    prismaService.enableShutdownHooks(app);

    // Global prefix
    app.setGlobalPrefix('api');

    // Security
    app.use(helmet());
    app.use(compression());
    app.enableCors();

    // Request validation
    app.useGlobalPipes(new ZodValidationPipe());
    app.useGlobalPipes(new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }));

    // Global interceptors & filters
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(
      new LoggingInterceptor(),
      new TimeoutInterceptor(),
      new TransformInterceptor(),
    );
    app.useGlobalGuards(new RateLimiterGuard());

    // Swagger docs
    const config = new DocumentBuilder()
      .setTitle('Soil Monitoring API')
      .setDescription('API documentation for soil monitoring system')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);

    // Start server
    const port = configService.get<number>('PORT', 3000);
    await app.listen(port);
    
    logger.log(`Application is running on port ${port}`);

    // Graceful shutdown
    const signals = ['SIGTERM', 'SIGINT'];
    for (const signal of signals) {
      process.on(signal, async () => {
        logger.log(`Received ${signal}, starting graceful shutdown`);
        await app.close();
        process.exit(0);
      });
    }

  } catch (error) {
    logger.error('Error during application bootstrap:', error);
    process.exit(1);
  }
}

bootstrap();