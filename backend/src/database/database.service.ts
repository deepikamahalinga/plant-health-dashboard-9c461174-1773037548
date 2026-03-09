import { 
  Injectable, 
  OnModuleInit, 
  OnModuleDestroy, 
  Logger 
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { 
  Prisma, 
  PrismaClientOptions 
} from '@prisma/client/runtime/library';

@Injectable()
export class PrismaService 
  extends PrismaClient<PrismaClientOptions>
  implements OnModuleInit, OnModuleDestroy {
  
  private readonly logger = new Logger(PrismaService.name);
  private readonly isDevelopment = process.env.NODE_ENV === 'development';

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'info' },
        { emit: 'stdout', level: 'warn' },
      ],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      // Connection pooling configuration
      connection: {
        pool: {
          min: 2,
          max: 10,
          idleTimeoutMillis: 30000,
          acquireTimeoutMillis: 60000,
        },
      },
    });

    // Query logging for development
    if (this.isDevelopment) {
      this.$on<any>('query', (e: Prisma.QueryEvent) => {
        this.logger.debug(`Query: ${e.query}`);
        this.logger.debug(`Duration: ${e.duration}ms`);
        this.logger.debug(`Params: ${e.params}`);
      });
    }

    // Error logging
    this.$on<any>('error', (e: Prisma.LogEvent) => {
      this.logger.error(`Database error: ${e.message}`);
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      this.logger.log('Successfully connected to database');
    } catch (error) {
      this.logger.error('Failed to connect to database:', error);
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.$disconnect();
      this.logger.log('Successfully disconnected from database');
    } catch (error) {
      this.logger.error('Error disconnecting from database:', error);
      throw error;
    }
  }

  /**
   * Health check method
   */
  async isHealthy(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      this.logger.error('Database health check failed:', error);
      return false;
    }
  }

  /**
   * Helper method for database transactions
   */
  async executeTransaction<T>(
    fn: (prisma: Prisma.TransactionClient) => Promise<T>
  ): Promise<T> {
    try {
      return await this.$transaction(async (prisma) => {
        return await fn(prisma);
      }, {
        maxWait: 5000, // max time to wait for transaction to start
        timeout: 10000, // max time for entire transaction
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
      });
    } catch (error) {
      this.logger.error('Transaction failed:', error);
      throw error;
    }
  }

  /**
   * Clean up resources and close connections
   */
  async cleanUp(): Promise<void> {
    try {
      await this.$disconnect();
    } catch (error) {
      this.logger.error('Error during cleanup:', error);
      throw error;
    }
  }

  /**
   * Get current connection status
   */
  async getConnectionStatus(): Promise<{
    isConnected: boolean;
    poolSize?: number;
    activeConnections?: number;
  }> {
    try {
      const isConnected = await this.isHealthy();
      // Note: Actual pool metrics might vary based on Prisma version and configuration
      return {
        isConnected,
      };
    } catch (error) {
      this.logger.error('Error getting connection status:', error);
      return {
        isConnected: false,
      };
    }
  }
}