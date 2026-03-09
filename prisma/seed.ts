import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import chalk from 'chalk';

// Types
interface SeedMetrics {
  recordsCreated: number;
  errors: Error[];
}

interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

interface SoilMetric {
  id: string;
  timestamp: Date;
  moisture: number;
  pH: number;
  temperature: number;
  locationId: string;
}

// Initialize Prisma Client
const prisma = new PrismaClient();

// Sample data generators
const generateLocation = (): Location => ({
  id: uuidv4(),
  name: `Field-${Math.floor(Math.random() * 100)}`,
  latitude: parseFloat((Math.random() * 180 - 90).toFixed(6)),
  longitude: parseFloat((Math.random() * 360 - 180).toFixed(6))
});

const generateSoilMetric = (locationId: string): SoilMetric => ({
  id: uuidv4(),
  timestamp: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
  moisture: parseFloat((Math.random() * 100).toFixed(2)),
  pH: parseFloat((Math.random() * 14).toFixed(2)),
  temperature: parseFloat((Math.random() * 50).toFixed(2)),
  locationId
});

// Main seed function
export async function seed(): Promise<SeedMetrics> {
  const metrics: SeedMetrics = {
    recordsCreated: 0,
    errors: []
  };

  try {
    console.log(chalk.blue('🌱 Starting database seed...'));

    // Clear existing data (optional)
    console.log(chalk.yellow('Clearing existing data...'));
    await prisma.soilMetric.deleteMany();
    await prisma.location.deleteMany();

    // Create locations first (parent entities)
    console.log(chalk.green('Creating locations...'));
    const locations: Location[] = [];
    for (let i = 0; i < 5; i++) {
      const location = generateLocation();
      try {
        await prisma.location.create({
          data: location
        });
        locations.push(location);
        metrics.recordsCreated++;
      } catch (error) {
        console.error(chalk.red(`Error creating location: ${error}`));
        metrics.errors.push(error as Error);
      }
    }

    // Create soil metrics
    console.log(chalk.green('Creating soil metrics...'));
    for (const location of locations) {
      for (let i = 0; i < 10; i++) {
        const soilMetric = generateSoilMetric(location.id);
        try {
          await prisma.soilMetric.create({
            data: soilMetric
          });
          metrics.recordsCreated++;
        } catch (error) {
          console.error(chalk.red(`Error creating soil metric: ${error}`));
          metrics.errors.push(error as Error);
        }
      }
    }

    console.log(chalk.green(`✅ Seed completed! Created ${metrics.recordsCreated} records`));
  } catch (error) {
    console.error(chalk.red('❌ Seed failed:', error));
    metrics.errors.push(error as Error);
  } finally {
    await prisma.$disconnect();
  }

  return metrics;
}

// Execute seed if running directly
if (require.main === module) {
  seed()
    .then((metrics) => {
      if (metrics.errors.length > 0) {
        console.error(chalk.red(`Seed completed with ${metrics.errors.length} errors`));
        process.exit(1);
      }
      process.exit(0);
    })
    .catch((error) => {
      console.error(chalk.red('Fatal error during seed:', error));
      process.exit(1);
    });
}