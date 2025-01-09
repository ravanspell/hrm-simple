import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { LoggerModule } from './logger/logger.module';
import { EmployeeLeavesModule } from './employee-leaves/employee-leaves.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { PermissionsGuard } from './auth/guards/permissions.guard';
import { AuthenticatedGuard } from './auth/guards/authenticated.guard';
import { FileManagementModule } from './file-management/file-management.module';
import { UtilitiesModule } from './utilities/utilities.module';
import { EmailSettingsModule } from './email-settings/email-settings.module';
import { OrganizationModule } from './organization/organization.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    UserModule,
    LoggerModule,
    EmployeeLeavesModule,
    AuthModule,
    FileManagementModule,
    UtilitiesModule,
    EmailSettingsModule,
    OrganizationModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      // apply authenticated guard for all endpoint routes.
      useClass: AuthenticatedGuard,
    },
    {
      provide: APP_GUARD,
      // apply permission guard for all endpoint routes.
      useClass: PermissionsGuard,
    },
  ],
})
export class AppModule {}
