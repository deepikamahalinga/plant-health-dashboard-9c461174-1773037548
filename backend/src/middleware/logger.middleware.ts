// src/middleware/logging.middleware.ts
import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export interface RequestWithId extends Request {
  id: string;
}

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: RequestWithId, res: Response, next: NextFunction): void {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';
    const requestId = uuidv4();
    
    // Attach request ID
    req.id = requestId;

    // Start time
    const startTime = Date.now();

    // Log request
    this.logger.log(
      `[${requestId}] ${method} ${originalUrl} - ${ip} - ${userAgent}`
    );

    // Log response when finished
    res.on('finish', () => {
      const { statusCode } = res;
      const contentLength = res.get('content-length');
      const responseTime = Date.now() - startTime;

      const logMessage = 
        `[${requestId}] ${method} ${originalUrl} ${statusCode} ${contentLength}B - ${responseTime}ms`;

      if (statusCode >= 500) {
        this.logger.error(logMessage);
      } else if (statusCode >= 400) {
        this.logger.warn(logMessage);
      } else {
        this.logger.log(logMessage);
      }
    });

    next();
  }
}

// src/middleware/logging.config.ts
export const loggingConfig = {
  development: {
    level: 'debug',
    prettyPrint: true,
  },
  production: {
    level: 'info',
    prettyPrint: false,
  },
  test: {
    level: 'warn',
    prettyPrint: false,
  },
};

// src/app.module.ts
import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { LoggingMiddleware } from './middleware/logging.middleware';

@Module({})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggingMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}

// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { loggingConfig } from './middleware/logging.config';

async function bootstrap() {
  // Set logging configuration based on environment
  const environment = process.env.NODE_ENV || 'development';
  const config = loggingConfig[environment];
  
  const app = await NestFactory.create(AppModule, {
    logger: config.level === 'debug' ? ['debug', 'verbose', 'log', 'warn', 'error'] 
                                   : ['error', 'warn', 'log'],
  });

  await app.listen(3000);
}
bootstrap();

// src/types/express.d.ts
declare namespace Express {
  export interface Request {
    id: string;
  }
}