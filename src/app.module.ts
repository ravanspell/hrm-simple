import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { DatabaseModule } from './database/database/database.module';
import { LoggerModule } from './logger/logger.module';


@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule, 
    UserModule, 
    LoggerModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
