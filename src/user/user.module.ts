import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { RolesService } from './roles.service';
import { ScopesService } from './scops.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Organization } from 'src/entities/organization.entity';
import { UserRepositoryProvider } from 'src/repository/user.repository';

@Module({
  imports: [TypeOrmModule.forFeature([User, Organization])],
  controllers: [UserController],
  providers: [UserService, ScopesService, RolesService, UserRepositoryProvider],
  exports: [UserService],
})
export class UserModule {}
