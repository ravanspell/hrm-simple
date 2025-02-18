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

@Entity(ROLE_TABLE)
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  organizationId: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: false })
  isSystemRole: boolean;

  @Column({ type: 'uuid' })
  createdBy: string;

  @Column({ type: 'uuid', nullable: true })
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
