/**
 * DatabaseModule is responsible for configuring and initializing the TypeORM
 * connection to the MySQL database. It uses the ConfigModule to inject
 * configuration values and sets up the DataSource with transactional support.
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { DataSource, DataSourceOptions } from 'typeorm';

const isDevelopment = process.env.ENV === 'dev';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      // TODO: config service to be used to get the configuration values
      useFactory: (configService: ConfigService) => ({
        name: 'default',
        type: 'mysql',
        host: 'mysql', // Use the Docker container name or IP address
        port: +configService.get('PRIMARY_DATABASE_PORT'),
        username: 'root', // Replace with your MySQL username
        password: '', // Replace with your MySQL password
        database: configService.get('PRIMARY_DATABASE'), // Replace with your MySQL database name
        timezone: 'Z', // Timezone
        synchronize: false, // Auto synchronize schema with database
        logging: isDevelopment, // Enable query logging for development only
        maxQueryExecutionTime: 1000, // Log queries that take longer than 1000 ms (1 second)
        extra: {
          connectionLimit: +configService.get(
            'PRIMARY_DATABASE_CONNECTION_LIMIT',
          ), // Maximum number of database connections in pool (default is 10)
        },
        insecureAuth: false, // Allow insecure authentication
        connectTimeout: 10000, // Connection timeout (in ms)
        entities: [__dirname + '/../**/*.entity.{js,ts}'], // Load all entities dynamically
      }),
      dataSourceFactory: async (options: DataSourceOptions) => {
        const dataSource = new DataSource(options);
        // add transactional support to the DataSource
        addTransactionalDataSource(dataSource);
        // initialize the DataSource to connect to the database
        await dataSource.initialize();
        // sync with change into the database when changes made
        if (isDevelopment) {
          await dataSource.synchronize();
        }
        console.log('Data Source has been initialized!!');
        return dataSource;
      },
    }),
  ],
})
export class DatabaseModule {}
