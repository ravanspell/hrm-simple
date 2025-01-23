import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { User } from '@/user/entities/user.entity';
import { PUSH_NOTIFICATION_TOKENS_TABLE } from '@/constants/dbTables';

@Entity(PUSH_NOTIFICATION_TOKENS_TABLE)
export class PushNotificationToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ type: 'varchar', unique: true })
  fcmToken: string;

  @Column({ type: 'boolean', default: true })
  @Index()
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastUsedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.pushNotificationTokens, {
    onDelete: 'CASCADE',
  })
  user: User;
}
