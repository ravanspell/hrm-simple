import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Organization } from '@/organization/entities/organization.entity';
import { UserRepository } from 'src/repository/user.repository';

@Module({
  imports: [TypeOrmModule.forFeature([User, Organization])],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService],
})
export class UserModule {}
