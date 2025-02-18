import { EFFECTIVE_USER_PERMISSIONS_VIEW } from '@/constants/dbTables';
import {
  Index,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity(EFFECTIVE_USER_PERMISSIONS_VIEW)
@Index('idx_effective_user_permissions', ['userId', 'organizationId'], {
  unique: true,
})
export class EffectiveUserPermission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  organizationId: string;

  @Column({ type: 'varchar', length: 20 })
  origin: 'ROLE' | 'DIRECT' | 'OVERRIDE';

  @CreateDateColumn()
  lastUpdated: Date;
}
