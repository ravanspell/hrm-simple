import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Organization } from '@/organization/entities/organization.entity';
import { ROLE_TABLE } from '@/constants/dbTables';
import { RolePermission } from './role-permission.entity';
import { UserRole } from './user-role.entity';
import { ROLE_COLUMNS } from '../constants/role-columns';

@Entity(ROLE_TABLE)
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: ROLE_COLUMNS.ORGANIZATION_ID })
  organizationId: string;

  @Column({ name: ROLE_COLUMNS.NAME })
  name: string;

  @Column({ nullable: true, name: ROLE_COLUMNS.DESCRIPTION })
  description: string;

  @Column({ default: false, name: ROLE_COLUMNS.IS_SYSTEM_ROLE })
  isSystemRole: boolean;

  @Column({ type: 'uuid', name: ROLE_COLUMNS.CREATED_BY })
  createdBy: string;

  @Column({ type: 'uuid', nullable: true, name: ROLE_COLUMNS.UPDATED_BY })
  updatedBy: string;

  @ManyToOne(() => Organization, (organization) => organization.roles, {
    onDelete: 'CASCADE',
  })
  organization: Organization;

  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.role)
  rolePermissions: RolePermission[];

  @OneToMany(() => UserRole, (userRole) => userRole.user)
  userRoles: UserRole[];
}
