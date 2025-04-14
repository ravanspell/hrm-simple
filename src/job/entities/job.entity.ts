import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Organization } from '@/organization/entities/organization.entity';
import { User } from '@/user/entities/user.entity';

export enum JobStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  UNPUBLISHED = 'UNPUBLISHED',
}

@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'jsonb' })
  description: object;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  salaryMin: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  salaryMax: number;

  @Column({ nullable: true })
  location: string;

  @Column({ type: 'enum', enum: JobStatus, default: JobStatus.DRAFT })
  status: JobStatus;

  @Column({ nullable: true })
  industry: string;

  @Column({ nullable: true })
  experienceRequired: string;

  @Column({ nullable: true })
  educationRequired: string;

  @Column({ default: false })
  sponsorshipConsidered: boolean;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ default: true })
  isRemote: boolean;

  @Column()
  organizationId: string;

  @Column()
  createdBy: string;

  @Column()
  updatedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Organization, (organization) => organization.jobs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdBy' })
  creator: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'updatedBy' })
  updater: User;
}
