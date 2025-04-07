import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

/**
 * Service responsible for running database initialization scripts
 * when the application starts.
 */
@Injectable()
export class DatabaseInitService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseInitService.name);
  private readonly scriptsEnabled: boolean;

  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {
    // Check if database initialization scripts are enabled
    this.scriptsEnabled =
      this.configService.get('DB_INIT_SCRIPTS_ENABLED') !== 'false';
  }

  /**
   * Lifecycle hook that runs when the module is initialized.
   * This is where we'll run our database setup scripts.
   */
  async onModuleInit() {
    if (!this.scriptsEnabled) {
      this.logger.log(
        'Database initialization scripts are disabled. Skipping...',
      );
      return;
    }

    this.logger.log('Running database initialization scripts...');

    try {
      // Run all initialization scripts
      await this.runInitializationScripts();
      this.logger.log(
        'Database initialization scripts completed successfully.',
      );
    } catch (error) {
      this.logger.error(
        'Error running database initialization scripts',
        error.stack,
      );
      // We don't throw the error to allow the application to continue starting
      // even if the scripts fail, but we log it for debugging
    }
  }

  /**
   * Runs all database initialization scripts in sequence.
   */
  private async runInitializationScripts(): Promise<void> {
    // Add all your initialization scripts here
    await this.setupPgcrypto();
    await this.setupFullTextSearch();
  }

  /**
   * Sets up the pgcrypto extension in the database.
   * This extension provides cryptographic functions for PostgreSQL.
   */
  private async setupPgcrypto(): Promise<void> {
    try {
      // Check if pgcrypto extension already exists
      const result = await this.dataSource.query(
        `SELECT EXISTS (
          SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto'
        ) as exists`,
      );

      const extensionExists = result[0].exists;

      if (!extensionExists) {
        this.logger.log('Installing pgcrypto extension...');
        await this.dataSource.query('CREATE EXTENSION IF NOT EXISTS pgcrypto');
        this.logger.log('pgcrypto extension installed successfully.');
      } else {
        this.logger.log('pgcrypto extension already exists.');
      }
    } catch (error) {
      this.logger.error(
        `Failed to setup pgcrypto: ${error.message}`,
        error.stack,
      );
      // We don't throw the error to allow the application to continue starting
      // even if the script fails, but we log it for debugging
    }
  }

  /**
   * Sets up full text search in the database.
   * This extension provides full text search functionality for PostgreSQL.
   */
  private async setupFullTextSearch(): Promise<void> {
    try {
      // Check if full text search extension already exists
      const result = await this.dataSource.query(
        `SELECT EXISTS (
          SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm'
        ) as exists`,
      );

      const extensionExists = result[0].exists;

      if (!extensionExists) {
        this.logger.log('Installing pg_trgm extension...');
        await this.dataSource.query('CREATE EXTENSION IF NOT EXISTS pg_trgm');
        this.logger.log('pg_trgm extension installed successfully.');
      } else {
        this.logger.log('pg_trgm extension already exists.');
      }
    } catch (error) {
      this.logger.error(
        `Failed to setup pg_trgm: ${error.message}`,
        error.stack,
      );
    }
  }
}
