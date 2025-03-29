/**
 * TypeORM CLI Configuration
 * 
 * This configuration file is used to synchronize database changes in the development environment
 * 
 * Usage: 
 *   - Run migrations: npm run typeorm migration:run
 *   - Generate migrations: npm run typeorm migration:generate -- -n MigrationName
 *   - Create empty migration: npm run typeorm migration:create -- -n MigrationName
 *   - Revert last migration: npm run typeorm migration:revert
 */

const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: '.env' });

// Fallback to default .env if .env is not found
if (!process.env.PRIMARY_DATABASE_HOST) {
  dotenv.config();
}

// Database connection options
const dbConfig = {
  type: 'postgres',
  host: process.env.PRIMARY_DATABASE_HOST,
  port: parseInt(process.env.PRIMARY_DATABASE_PORT, 10),
  username: process.env.PRIMARY_DATABASE_USERNAME,
  password: process.env.PRIMARY_DATABASE_PASSWORD,
  database: process.env.PRIMARY_DATABASE_DATABASE,
};

/**
 * TypeORM configuration for CLI operations
 * This configuration is used by TypeORM CLI to perform database operations
 */
module.exports = {
  ...dbConfig,
  logging: process.env.ENV === 'dev' || false,
  logger: 'advanced-console',
  
  // Synchronize should be false in production
  // In development, you can enable it for quick schema updates
  synchronize: process.env.ENV === 'dev' || false,
  
  // Entity discovery configuration
  entities: [
    path.join(__dirname, 'dist/**/*.entity.js'),
    path.join(__dirname, 'dist/**/*.entity{.ts,.js}'),
  ],
  
  // Migration configuration
  migrations: [
    path.join(__dirname, 'dist/migrations/**/*{.ts,.js}'),
  ],
  migrationsRun: process.env.DATABASE_MIGRATIONS_RUN === 'true' || false,
  migrationsTableName: 'migrations',
  
  // CLI configuration for migration generation
  cli: {
    entitiesDir: 'src/entities',
    migrationsDir: 'src/migrations'
  },
  
  // Connection pooling configuration
  extra: {
    // Connection pool settings
    max: parseInt(process.env.PRIMARY_DATABASE_POOL_MAX || 20, 10),
    min: parseInt(process.env.PRIMARY_DATABASE_POOL_MIN || 5, 10),
    idleTimeoutMillis: parseInt(process.env.PRIMARY_DATABASE_IDLE_TIMEOUT || 30000, 10),
    connectionTimeoutMillis: parseInt(process.env.PRIMARY_DATABASE_CONNECTION_TIMEOUT || 2000, 10),
  }
};