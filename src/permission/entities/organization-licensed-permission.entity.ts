import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { SystemPermission } from './system-permission.entity';
import { Organization } from '@/organization/entities/organization.entity';
import { RolePermission } from '@/role/entities/role-permission.entity';
import { ORGANIZATION_LICENSED_PERMISSION_COLUMNS } from '../constants/table-columns';

/**
 * Entity representing an organization's licensed permissions
 * @class OrganizationLicensedPermission
 */
@Entity('organization_licensed_permissions')
@Index('idx_olf_active_permission', [
  'organizationId',
  'systemPermissionId',
  'isActive',
])
export class OrganizationLicensedPermission {
  @PrimaryGeneratedColumn('uuid', {
    name: ORGANIZATION_LICENSED_PERMISSION_COLUMNS.ID,
  })
  id: string;

  @Column({
    type: 'uuid',
    name: ORGANIZATION_LICENSED_PERMISSION_COLUMNS.ORGANIZATION_ID,
  })
  organizationId: string;

  @Column({
    type: 'uuid',
    name: ORGANIZATION_LICENSED_PERMISSION_COLUMNS.SYSTEM_PERMISSION_ID,
  })
  systemPermissionId: string;

  @Column({
    default: true,
    name: ORGANIZATION_LICENSED_PERMISSION_COLUMNS.IS_ACTIVE,
  })
  isActive: boolean;

  @Column({
    name: ORGANIZATION_LICENSED_PERMISSION_COLUMNS.VALID_FROM,
  })
  validFrom: Date;

  @Column({
    nullable: true,
    name: ORGANIZATION_LICENSED_PERMISSION_COLUMNS.VALID_UNTIL,
  })
  validUntil: Date;

  @CreateDateColumn({
    name: ORGANIZATION_LICENSED_PERMISSION_COLUMNS.CREATED_AT,
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: ORGANIZATION_LICENSED_PERMISSION_COLUMNS.UPDATED_AT,
  })
  updatedAt: Date;

  @Column({
    type: 'uuid',
    name: ORGANIZATION_LICENSED_PERMISSION_COLUMNS.CREATED_BY,
  })
  createdBy: string;

  @Column({
    type: 'uuid',
    nullable: true,
    name: ORGANIZATION_LICENSED_PERMISSION_COLUMNS.UPDATED_BY,
  })
  updatedBy: string;

  @ManyToOne(() => Organization, (org) => org.licensedPermissions)
  @JoinColumn()
  organization: Organization;

  @ManyToOne(
    () => SystemPermission,
    (permission) => permission.organizationLicenses,
  )
  @JoinColumn()
  systemPermission: SystemPermission;

  @OneToMany(
    () => RolePermission,
    (rolePermission) => rolePermission.organizationLicensedPermission,
    { onDelete: 'CASCADE' },
  )
  rolePermissions: RolePermission[];
}
