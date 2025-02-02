import { Module } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { PermissionController } from './permission.controller';
import { EffectiveUserPermissionsRepository } from './repositories/effective-user-permission.repository';
import { OrganizationLicensedPermissionRepository } from './repositories/organization-licensed-permission.repository';
import { PermissionCategoryRepository } from './repositories/permission-category.repository';
import { PermissionCategoryController } from './permission-category.controller';
import { SystemPermissionController } from './system-permission.controller';
import { UserDirectPermissionRepository } from './repositories/user-direct-permission.repository';
import { SystemPermissionRepository } from './repositories/system-permission.repository';

@Module({
  controllers: [PermissionController],
  providers: [
    PermissionService,
    EffectiveUserPermissionsRepository,
    OrganizationLicensedPermissionRepository,
    PermissionCategoryRepository,
    UserDirectPermissionRepository,
    SystemPermissionRepository,
    PermissionCategoryController,
    SystemPermissionController,
  ],
})
export class PermissionModule {}
