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
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  systemPermissionId: string;

  @Column({ type: 'uuid' })
  organizationId: string;

  @Column({ default: false })
  isOverride: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'uuid' })
  createdBy: string;

  @Column({ type: 'uuid', nullable: true })
  updatedBy: string;

  @VersionColumn()
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
