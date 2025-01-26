import {
  Injectable,
  LoggerService as NestLoggerService,
  Scope,
} from '@nestjs/common';
import * as winston from 'winston';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';

/**
 * Custom log levels matching CloudWatch standard levels
 */
export const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
} as const;

export type LogLevel = keyof typeof LOG_LEVELS;

export interface LogMetadata {
  context?: string;
  correlationId?: string;
  userId?: string;
  [key: string]: any;
}

/**
 * Configuration interface for the logger service
 * Aligns with CloudWatch agent configuration
 */
export interface LoggerConfig {
  logLevel: LogLevel;
  logFilePath: string; // Path where CloudWatch agent will look for logs
  serviceContext: string;
}

/**
 * Custom logger service that writes to a specific file location
 * which CloudWatch agent is configured to monitor
 */
@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService implements NestLoggerService {
  private logger: winston.Logger;
  private context?: string;

  constructor(private configService: ConfigService) {
    this.initializeLogger();
  }

  /**
   * Initializes Winston logger with file transport
   * Creates log file in the location monitored by CloudWatch agent
   * @private
   */
  private initializeLogger(): void {
    // Configure based on environment or use defaults that match CloudWatch agent config
    const config: LoggerConfig = {
      logLevel: (this.configService.get('LOG_LEVEL') || 'info') as LogLevel,
      logFilePath:
        this.configService.get('LOG_FILE_PATH') || '/app/logs/app.log',
      serviceContext: this.configService.get('SERVICE_NAME') || 'app',
    };

    // Ensure log directory exists
    const logDir = path.dirname(config.logFilePath);
    require('fs').mkdirSync(logDir, { recursive: true });

    // Define log format optimized for CloudWatch parsing
    const logFormat = winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json(),
      winston.format.printf((info) => {
        const { timestamp, level, message, context, correlationId, ...meta } =
          info;
        // Structure log entries to be easily parsed by CloudWatch
        return JSON.stringify({
          timestamp,
          level,
          context: context || this.context || config.serviceContext,
          correlationId,
          message,
          ...meta,
        });
      }),
    );

    // Create Winston logger instance with file transport only
    // Console transport removed as CloudWatch will handle console output
    this.logger = winston.createLogger({
      level: config.logLevel,
      levels: LOG_LEVELS,
      format: logFormat,
      transports: [
        new winston.transports.File({
          filename: config.logFilePath,
          maxsize: 10485760, // 10MB
          maxFiles: 5, // Keep 5 files before rotating
          tailable: true, // Keep newest logs
          format: logFormat,
        }),
      ],
    });

    // Add console transport in development environment only
    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(
        new winston.transports.Console({
          format: winston.format.combine(winston.format.colorize(), logFormat),
        }),
      );
    }
  }

  /**
   * Sets the context for subsequent log messages
   * @param context - The context string (usually service/class name)
   */
  setContext(context: string): this {
    this.context = context;
    return this;
  }

  /**
   * Logs a debug level message
   * @param message - The log message
   * @param metadata - Additional metadata to include in the log
   */
  debug(message: string, metadata: LogMetadata = {}): void {
    this.logger.debug(message, this.formatMetadata(metadata));
  }

  /**
   * Logs an info level message
   * @param message - The log message
   * @param metadata - Additional metadata to include in the log
   */
  log(message: string, metadata: LogMetadata = {}): void {
    this.info(message, metadata);
  }

  /**
   * Logs an info level message
   * @param message - The log message
   * @param metadata - Additional metadata to include in the log
   */
  info(message: string, metadata: LogMetadata = {}): void {
    this.logger.info(message, this.formatMetadata(metadata));
  }

  /**
   * Logs a warning level message
   * @param message - The log message
   * @param metadata - Additional metadata to include in the log
   */
  warn(message: string, metadata: LogMetadata = {}): void {
    this.logger.warn(message, this.formatMetadata(metadata));
  }

  /**
   * Logs an error level message
   * @param message - The error message or Error object
   * @param metadata - Additional metadata to include in the log
   */
  error(message: string | Error, metadata: LogMetadata = {}): void {
    const errorMessage = message instanceof Error ? message.message : message;
    const stack = message instanceof Error ? message.stack : undefined;

    this.logger.error(
      errorMessage,
      this.formatMetadata({
        ...metadata,
        stack,
      }),
    );
  }

  /**
   * Formats metadata with context and standard fields
   * @private
   */
  private formatMetadata(metadata: LogMetadata): LogMetadata {
    return {
      ...metadata,
      context: metadata.context || this.context,
      environment: process.env.NODE_ENV || 'development',
      applicationVersion: process.env.APP_VERSION || '1.0.0',
    };
  }
}
