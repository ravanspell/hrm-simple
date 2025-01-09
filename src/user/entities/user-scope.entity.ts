import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { Scope } from './scope.entity';
import { USER_SCOPE_TABLE } from '@/constants/dbTables';

@Entity(USER_SCOPE_TABLE)
export class UserScope {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.customScopes, {
    onDelete: 'CASCADE',
  })
  user: User;

  @ManyToOne(() => Scope, (scope) => scope.userScopes, {
    onDelete: 'CASCADE',
  })
  scope: Scope;
}
