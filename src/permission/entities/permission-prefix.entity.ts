import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
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
}
