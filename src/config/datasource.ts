import { DataSource } from 'typeorm';
import {
    initializeTransactionalContext,
    addTransactionalDataSource,
    StorageDriver
} from 'typeorm-transactional';

let dataSourceInstance: DataSource;

function getDataSource(): DataSource {
    console.log("im executed");

    if (!dataSourceInstance) {
        initializeTransactionalContext({ storageDriver: StorageDriver.AUTO });
        console.log("im executed -> data source created");
        dataSourceInstance = new DataSource({
            type: 'mysql',
            host: 'mysql', // Use the Docker container name or IP address
            port: 3306, // Default MySQL port
            username: 'root', // Replace with your MySQL username
            password: '', // Replace with your MySQL password
            database: 'myhrm-db-v1', // Replace with your MySQL database name
            timezone: 'Z', // Timezone
            synchronize: false, // Auto synchronize schema with database
            logging: true, // Enable query logging
            maxQueryExecutionTime: 1000, // Log queries that take longer than 1000 ms (1 second)
            extra: {
                connectionLimit: 10, // Maximum number of database connections in pool (default is 10)
            },
            insecureAuth: false, // Allow insecure authentication
            connectTimeout: 10000, // Connection timeout (in ms)
            entities: [__dirname + '/../**/*.entity.{js,ts}']
        });

        addTransactionalDataSource(dataSourceInstance);
        // Initialize the data source if not already done
        if (!dataSourceInstance.isInitialized) {
            dataSourceInstance.initialize().then(() => {
                console.log('Data Source has been initialized!');
            }).catch((error) => {
                console.error('Error initializing DataSource:', error);
            });
        }
        return dataSourceInstance;
    }
}
export default getDataSource();
