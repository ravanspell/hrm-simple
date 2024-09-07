import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { DatabaseModule } from './database/database.module';
import { LoggerModule } from './logger/logger.module';
import { EmployeeLeavesModule } from './employee-leaves/employee-leaves.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule, 
    UserModule, 
    LoggerModule, 
    EmployeeLeavesModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
