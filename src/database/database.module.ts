/**
 * DatabaseModule is responsible for configuring and initializing the TypeORM
 * connection to the PostgreSQL database. It uses the ConfigModule to inject
 * configuration values and sets up the DataSource with transactional support.
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { DataSource, DataSourceOptions } from 'typeorm';
import { ENVIRONMENT } from '../constants/common';
import { DatabaseInitService } from './database-init.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (
        configService: ConfigService,
      ): Promise<TypeOrmModuleOptions> => {
        const isDevelopment =
          configService.get('ENV') === ENVIRONMENT.DEVELOPMENT;
        const isLocal = configService.get('ENV') === ENVIRONMENT.LOCAL;
        return {
          name: 'default',
          type: 'postgres',
          host: configService.get('PRIMARY_DATABASE_HOST'),
          port: +configService.get('PRIMARY_DATABASE_PORT'),
          username: configService.get('PRIMARY_DATABASE_USERNAME'),
          password: configService.get<string>('PRIMARY_DATABASE_PASSWORD'),
          database: configService.get<string>('PRIMARY_DATABASE'),
          // database query logging only in local environment
          logging: isLocal,
          maxQueryExecutionTime: +configService.get(
            'PRIMARY_DATABASE_MAX_QUERY_EXECUTION_TIME',
          ),
          entities: [__dirname + '/../**/*.entity.{js,ts}'],
          migrations: [__dirname + '/../migrations/**/*{.ts,js}'],
          subscribers: [__dirname + '/../**/*.subscriber.{js,ts}'],
          // only synchronize in local or development environment
          synchronize: isDevelopment || isLocal,
          migrationsRun:
            configService.get('DATABASE_MIGRATIONS_RUN') === 'true',
          migrationsTableName: 'migrations',
          extra: {
            connectionLimit: +configService.get(
              'PRIMARY_DATABASE_CONNECTION_LIMIT',
            ),
            idleTimeoutMillis: +configService.get(
              'PRIMARY_DATABASE_IDLE_TIMEOUT',
            ),
            connectionTimeoutMillis: +configService.get(
              'PRIMARY_DATABASE_CONNECTION_TIMEOUT',
            ),
          },
        };
      },
      dataSourceFactory: async (options: DataSourceOptions) => {
        const dataSource = new DataSource(options);
        // add transactional support to the DataSource
        addTransactionalDataSource(dataSource);
        // initialize the DataSource to connect to the database
        await dataSource.initialize();
        console.log('Data Source has been initialized!!');
        return dataSource;
      },
    }),
  ],
  providers: [DatabaseInitService],
})
export class DatabaseModule {}
