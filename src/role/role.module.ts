import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { RoleRepository } from './repository/role.repository';
import { UserRoleRepository } from './repository/user-role.repository';
import { RolePermissionRepository } from './repository/role-permission.repository';

@Module({
  controllers: [RoleController],
  providers: [
    RoleService,
    RoleRepository,
    UserRoleRepository,
    RolePermissionRepository,
  ],
})
export class RoleModule {}
