import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { PermissionCategory } from './permission-category.entity';
import { OrganizationLicensedPermission } from './organization-licensed-permission.entity';
import { UserDirectPermission } from './user-direct-permission.entity';
import { SYSTEM_PERMISSIONS_TABLE } from '@/constants/dbTables';
import { SYSTEM_PERMISSION_COLUMNS } from '../constants/table-columns';

export enum PermissionType {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

/**
 * Entity representing a system permission in the system
 * @class SystemPermission
 */
@Entity(SYSTEM_PERMISSIONS_TABLE)
export class SystemPermission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'uuid',
    name: SYSTEM_PERMISSION_COLUMNS.CATEGORY_ID,
  })
  categoryId: string;

  @Column({
    type: 'enum',
    enum: PermissionType,
    name: SYSTEM_PERMISSION_COLUMNS.TYPE,
  })
  type: PermissionType;

  @Column({ name: SYSTEM_PERMISSION_COLUMNS.DISPLAY_NAME })
  displayName: string;

  @Column({
    type: 'text',
    nullable: true,
    name: SYSTEM_PERMISSION_COLUMNS.DESCRIPTION,
  })
  description: string;

  @Column({
    default: false,
    name: SYSTEM_PERMISSION_COLUMNS.IS_BASE_PERMISSION,
  })
  isBasePermission: boolean;

  @CreateDateColumn({ name: SYSTEM_PERMISSION_COLUMNS.CREATED_AT })
  createdAt: Date;

  @UpdateDateColumn({ name: SYSTEM_PERMISSION_COLUMNS.UPDATED_AT })
  updatedAt: Date;

  @Column({ type: 'uuid', name: SYSTEM_PERMISSION_COLUMNS.CREATED_BY })
  createdBy: string;

  @Column({
    type: 'uuid',
    nullable: true,
    name: SYSTEM_PERMISSION_COLUMNS.UPDATED_BY,
  })
  updatedBy: string;

  @OneToMany(
    () => OrganizationLicensedPermission,
    (permission) => permission.systemPermission,
  )
  organizationLicenses: OrganizationLicensedPermission[];

  @OneToMany(
    () => UserDirectPermission,
    (permission) => permission.systemPermission,
  )
  userDirectPermissions: UserDirectPermission[];

  @ManyToOne(
    () => PermissionCategory,
    (category) => category.systemPermissions,
    {
      onDelete: 'CASCADE',
    },
  )
  category: PermissionCategory;
}
