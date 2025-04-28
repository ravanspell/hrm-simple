import {
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  PrimaryGeneratedColumn,
  Index,
} from 'typeorm';
import { BASE_ENTITY_COLUMNS } from '@/constants/common';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid', { name: BASE_ENTITY_COLUMNS.ID })
  id: string;

  @CreateDateColumn({ name: BASE_ENTITY_COLUMNS.CREATED_AT })
  createdAt: Date;

  @UpdateDateColumn({ name: BASE_ENTITY_COLUMNS.UPDATED_AT })
  updatedAt: Date;

  @Column({ type: 'uuid', name: BASE_ENTITY_COLUMNS.CREATED_BY })
  @Index()
  createdBy: string;

  @Column({
    type: 'uuid',
    nullable: true,
    name: BASE_ENTITY_COLUMNS.UPDATED_BY,
  })
  @Index()
  updatedBy: string;
}
