import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { RolesService } from './roles.service';
import { ScopesService } from './scops.service';

@Module({
  controllers: [UserController],
  providers: [UserService, ScopesService, RolesService],
  exports: [UserService],
})
export class UserModule {}
