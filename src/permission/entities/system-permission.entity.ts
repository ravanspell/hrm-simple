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
import { PermissionPrefix } from './permission-prefix.entity';

/**
 * Entity representing a system permission in the system
 * @class SystemPermission
 */
@Entity(SYSTEM_PERMISSIONS_TABLE)
export class SystemPermission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  categoryId: string;

  @Column()
  resource: string;

  @Column({ unique: true })
  permissionKey: string;

  @Column()
  displayName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: false })
  isBasePermission: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'uuid' })
  createdById: string;

  @Column({ type: 'uuid', nullable: true })
  updatedById: string;

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

  @ManyToOne(() => PermissionPrefix, (prefix) => prefix.systemPermissions)
  prefix: PermissionPrefix;

  @ManyToOne(() => PermissionCategory, (category) => category.systemPermissions)
  category: PermissionCategory;
}
