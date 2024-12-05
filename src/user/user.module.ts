import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { RolesService } from './roles.service';

@Module({
  controllers: [UserController],
  providers: [UserService, RolesService],
  exports: [UserService]
})
export class UserModule {}
