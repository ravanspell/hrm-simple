import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { RoleRepository } from './repository/role.repository';
import { UserRoleRepository } from './repository/user-role.repository';
import { RolePermissionRepository } from './repository/role-permission.repository';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [RoleController],
  providers: [
    RoleService,
    RoleRepository,
    UserRoleRepository,
    RolePermissionRepository,
  ],
})
export class RoleModule {}
