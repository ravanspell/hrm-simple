import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { RolesService } from './roles.service';
import { ScopesService } from './scops.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Organization } from '@/organization/entities/organization.entity';
import { UserRepository } from 'src/repository/user.repository';
import { RoleRepository } from '@/repository/role.repository';
import { UserRoleRepository } from '@/repository/user-role.repository';

@Module({
  imports: [TypeOrmModule.forFeature([User, Organization])],
  controllers: [UserController],
  providers: [
    UserService,
    ScopesService,
    RolesService,
    UserRepository,
    RoleRepository,
    UserRoleRepository,
  ],
  exports: [UserService],
})
export class UserModule {}
