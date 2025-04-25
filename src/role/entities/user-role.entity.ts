import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  Index,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Role } from './role.entity';
import { USER_ROLE_TABLE } from '@/constants/dbTables';
import { USER_ROLE_COLUMNS } from '../constants/role-columns';

@Entity(USER_ROLE_TABLE)
@Index('idx_user_role_user', ['userId'])
@Index('idx_user_role_role', ['roleId'])
@Index('idx_user_role_org', ['organizationId'])
@Index('idx_user_role_composite', ['userId', 'roleId', 'organizationId'], {
  unique: true,
})
export class UserRole {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: USER_ROLE_COLUMNS.USER_ID })
  userId: string;

  @Column({ type: 'uuid', name: USER_ROLE_COLUMNS.ROLE_ID })
  roleId: string;

  @Column({ type: 'uuid', name: USER_ROLE_COLUMNS.ORGANIZATION_ID })
  organizationId: string;

  @ManyToOne(() => User, (user) => user.roles)
  user: User;

  @ManyToOne(() => Role, (role) => role.userRoles)
  role: Role;
}
