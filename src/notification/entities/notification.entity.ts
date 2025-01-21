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
import { Organization } from '@/organization/entities/organization.entity';

@Entity('notifications')
export class Notification {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    @Index()
    organizationId: string;

    @Column()
    @Index()
    userId: string;

    @Column({ length: 255 })
    title: string;

    @Column('text')
    body: string;

    @Column({ type: 'json', nullable: true })
    data: Record<string, any>;

    @Column({ default: false })
    isRead: boolean;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;

    @ManyToOne(() => Organization, (organization) => organization.notifications, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'organizationId' })
    @Index()
    organization: Organization;

    @ManyToOne(() => User, (user) => user.notifications, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    @Index()
    user: User;
}