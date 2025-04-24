import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from './role.entity';
import { ROLE_PERMISSION_COLUMNS } from '../constants/role-columns';

@Entity()
export class RolePermission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: ROLE_PERMISSION_COLUMNS.ROLE_ID })
  roleId: string;

  @Column({ name: ROLE_PERMISSION_COLUMNS.SYSTEM_PERMISSION_ID })
  systemPermissionId: string;

  @Column({ name: ROLE_PERMISSION_COLUMNS.ORGANIZATION_ID })
  organizationId: string;

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
  role: Role;
}
