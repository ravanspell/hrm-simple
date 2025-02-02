import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { SystemPermission } from './system-permission.entity';
import { PERMISSION_PREFIXES_TABLE } from '@/constants/dbTables';

@Entity(PERMISSION_PREFIXES_TABLE)
export class PermissionPrefix {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, unique: true })
  prefix: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;
  // defined this as lazy loaded relationship as this relationship is being used rarely
  @OneToMany(() => SystemPermission, (permission) => permission.prefix, {
    lazy: true,
  })
  systemPermissions: Promise<SystemPermission[]>;
}
