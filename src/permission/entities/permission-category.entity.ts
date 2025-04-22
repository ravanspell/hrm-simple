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
import { PERMISSION_CATEGORY_COLUMNS } from '../constants/table-columns';

/**
 * Entity representing a permission category in the system
 * @class PermissionCategory
 */
@Entity(PERMISSION_CATEGORIES_TABLE)
export class PermissionCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, name: PERMISSION_CATEGORY_COLUMNS.NAME })
  name: string;

  @Column({ unique: true, name: PERMISSION_CATEGORY_COLUMNS.KEY })
  key: string;

  @Column({
    type: 'text',
    nullable: true,
    name: PERMISSION_CATEGORY_COLUMNS.DESCRIPTION,
  })
  description: string;

  @Column({ default: 0, name: PERMISSION_CATEGORY_COLUMNS.DISPLAY_ORDER })
  displayOrder: number;

  @Column({ nullable: true, name: PERMISSION_CATEGORY_COLUMNS.CREATED_BY })
  createdBy: string;

  @Column({ nullable: true, name: PERMISSION_CATEGORY_COLUMNS.UPDATED_BY })
  updatedBy: string;

  @CreateDateColumn({ name: PERMISSION_CATEGORY_COLUMNS.CREATED_AT })
  createdAt: Date;

  @UpdateDateColumn({ name: PERMISSION_CATEGORY_COLUMNS.UPDATED_AT })
  updatedAt: Date;

  @OneToMany(() => SystemPermission, (permission) => permission.category)
  systemPermissions: SystemPermission[];
}
