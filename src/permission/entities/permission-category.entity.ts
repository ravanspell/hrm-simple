import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';
import { SystemPermission } from './system-permission.entity';
import { PERMISSION_CATEGORIES_TABLE } from '@/constants/dbTables';

/**
 * Entity representing a permission category in the system
 * @class PermissionCategory
 */
@Entity(PERMISSION_CATEGORIES_TABLE)
export class PermissionCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: 0 })
  displayOrder: number;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => SystemPermission, (permission) => permission.category)
  systemPermissions: SystemPermission[];
}
