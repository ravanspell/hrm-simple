import { Organization } from '@/organization/entities/organization.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('general_settings')
export class GeneralSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id', unique: true })
  organization_id: string;

  @Column({ name: 'announcement_expire_days', default: 30 })
  announcement_expire_days: number;

  @Column({ name: 'records_per_page', default: 10 })
  records_per_page: number;

  @Column({ name: 'notice_period_days', default: 60 })
  notice_period_days: number;

  @Column({ name: 'currency', default: 'USD' })
  currency: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @ManyToOne(() => Organization, (organization) => organization.generalSettings)
  organization: Organization;
}
