import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  VersionColumn,
} from 'typeorm';
import { SystemPermission } from './system-permission.entity';
import { Organization } from '@/organization/entities/organization.entity';
import { USER_DIRECT_PERMISSION_COLUMNS } from '../constants/table-columns';

/**
 * Entity representing a user's direct permissions
 * @class UserDirectPermission
 */
@Entity('user_direct_permissions')
@Index('idx_user_direct_permissions', [
  'userId',
  'organizationId',
  'systemPermissionId',
])
export class UserDirectPermission {
  @PrimaryGeneratedColumn('uuid', { name: USER_DIRECT_PERMISSION_COLUMNS.ID })
  id: string;

  @Column({ type: 'uuid', name: USER_DIRECT_PERMISSION_COLUMNS.USER_ID })
  userId: string;

  @Column({
    type: 'uuid',
    name: USER_DIRECT_PERMISSION_COLUMNS.SYSTEM_PERMISSION_ID,
  })
  systemPermissionId: string;

  @Column({
    type: 'uuid',
    name: USER_DIRECT_PERMISSION_COLUMNS.ORGANIZATION_ID,
  })
  organizationId: string;

  @Column({
    default: false,
    name: USER_DIRECT_PERMISSION_COLUMNS.IS_OVERRIDE,
  })
  isOverride: boolean;

  @CreateDateColumn({
    name: USER_DIRECT_PERMISSION_COLUMNS.CREATED_AT,
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: USER_DIRECT_PERMISSION_COLUMNS.UPDATED_AT,
  })
  updatedAt: Date;

  @Column({ type: 'uuid', name: USER_DIRECT_PERMISSION_COLUMNS.CREATED_BY })
  createdBy: string;

  @Column({
    type: 'uuid',
    nullable: true,
    name: USER_DIRECT_PERMISSION_COLUMNS.UPDATED_BY,
  })
  updatedBy: string;

  @VersionColumn({
    name: USER_DIRECT_PERMISSION_COLUMNS.VERSION,
  })
  version: number;

  @ManyToOne(
    () => SystemPermission,
    (permission) => permission.userDirectPermissions,
  )
  @JoinColumn()
  systemPermission: SystemPermission;

  @ManyToOne(() => Organization, (org) => org.userDirectPermissions)
  @JoinColumn()
  organization: Organization;
}
