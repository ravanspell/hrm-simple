import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Role } from './role.entity';
import { ROLE_PERMISSION_COLUMNS } from '../constants/role-columns';
import { OrganizationLicensedPermission } from '../../permission/entities/organization-licensed-permission.entity';

@Entity()
export class RolePermission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: ROLE_PERMISSION_COLUMNS.ROLE_ID })
  roleId: string;

  @Column({ name: ROLE_PERMISSION_COLUMNS.ORGANIZATION_LICENSED_PERMISSION_ID })
  organizationLicensedPermissionId: string;

  @Column({ type: 'uuid', name: ROLE_PERMISSION_COLUMNS.CREATED_BY })
  createdBy: string;

  @Column({
    type: 'uuid',
    nullable: true,
    name: ROLE_PERMISSION_COLUMNS.UPDATED_BY,
  })
  updatedBy: string;

  @CreateDateColumn({ name: ROLE_PERMISSION_COLUMNS.CREATED_AT })
  createdAt: Date;

  @UpdateDateColumn({ name: ROLE_PERMISSION_COLUMNS.UPDATED_AT })
  updatedAt: Date;

  @ManyToOne(() => Role, (role) => role.rolePermissions)
  @JoinColumn({ name: 'roleId' })
  role: Role;

  @ManyToOne(
    () => OrganizationLicensedPermission,
    (permission) => permission.rolePermissions,
  )
  @JoinColumn({ name: 'organizationLicensedPermissionId' })
  organizationLicensedPermission: OrganizationLicensedPermission;
}
