import { DataSource } from 'typeorm';
import { 
    initializeTransactionalContext, 
    addTransactionalDataSource, 
    StorageDriver 
} from 'typeorm-transactional';

const dataSource = new DataSource({
	type: 'mysql',
    host: 'mysql',
    port: 3306,
    username: 'root',
    password: '',
    database: 'myhrm-db-v1',
    timezone: 'Z', // Timezone
    synchronize: true, // Auto synchronize schema with database
    logging: true, // Enable query loggin
    extra: {
        connectionLimit: 10, // Maximum number of database connections in pool (default is 10)
    },
    insecureAuth: false, // Allow insecure authentication
    connectTimeout: 10000, // Connection timeout (in ms)
});

initializeTransactionalContext({ storageDriver: StorageDriver.ASYNC_LOCAL_STORAGE });
addTransactionalDataSource(dataSource);

export default dataSource;