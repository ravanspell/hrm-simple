import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '@/user/entities/user.entity';
import { NOTIFICATION_TOKENS_TABLE } from '@/constants/dbTables';

@Entity(NOTIFICATION_TOKENS_TABLE)
export class NotificationToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  userId: string;

  @Column({ type: 'varchar', unique: true })
  @Index()
  fcmToken: string;

  @Column({ type: 'boolean', default: true })
  @Index()
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastUsedAt: Date;

  @ManyToOne(() => User, (user) => user.notificationTokens, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;
}
