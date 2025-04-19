import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { LoggerModule } from './logger/logger.module';
import { EmployeeLeavesModule } from './employee-leaves/employee-leaves.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { PermissionsGuard } from './auth/guards/permissions.guard';
import { AuthenticatedGuard } from './auth/guards/authenticated.guard';
import { FileManagementModule } from './file-management/file-management.module';
import { UtilitiesModule } from './utilities/utilities.module';
import { EmailSettingsModule } from './email-settings/email-settings.module';
import { OrganizationModule } from './organization/organization.module';
import { DatabaseModule } from './database/database.module';
import { NotificationModule } from './notification/notification.module';
import { PermissionModule } from './permission/permission.module';
import { RoleModule } from './role/role.module';
import { SentryModule, SentryGlobalFilter } from '@sentry/nestjs/setup';
import { TerminusModule } from '@nestjs/terminus';
import { CandidateModule } from './candidate/candidate.module';
import { JobModule } from './job/job.module';
import { TenantMiddleware } from './middlewares/tenant.middleware';

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
    NotificationModule,
    PermissionModule,
    RoleModule,
    CandidateModule,
    JobModule,
    SentryModule.forRoot(),
    TerminusModule,
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
    {
      provide: APP_FILTER,
      useClass: SentryGlobalFilter,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
