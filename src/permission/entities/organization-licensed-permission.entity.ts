import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { SystemPermission } from './system-permission.entity';
import { Organization } from '@/organization/entities/organization.entity';

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
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  organizationId: string;

  @Column({ type: 'uuid' })
  systemPermissionId: string;

  @Column({ default: true })
  isActive: boolean;

  @Column()
  validFrom: Date;

  @Column({ nullable: true })
  validUntil: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'uuid' })
  createdById: string;

  @Column({ type: 'uuid', nullable: true })
  updatedById: string;

  @ManyToOne(() => Organization, (org) => org.licensedPermissions)
  @JoinColumn()
  organization: Organization;

  @ManyToOne(
    () => SystemPermission,
    (permission) => permission.organizationLicenses,
  )
  @JoinColumn()
  systemPermission: SystemPermission;
}
