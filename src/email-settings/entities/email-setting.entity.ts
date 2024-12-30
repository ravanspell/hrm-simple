import { EMAIL_SETTINGS_TABLE } from 'src/constants/dbTables';
import { Organization } from 'src/entities/organization.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

@Entity(EMAIL_SETTINGS_TABLE)
@Index('idx_organization_id', ['organizationId']) // Optional, for indexing organizationId
export class EmailSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  emailHost: string;

  @Column()
  emailPort: number;

  @Column()
  displayName: string;

  @Column()
  defaultFromEmail: string;

  @Column()
  emailHostUsername: string;

  @Column()
  emailAuthPassword: string;

  @Column({ default: false })
  useTLS: boolean;

  @Column({ default: false })
  useSSL: boolean;

  @Column({ default: false })
  isPrimary: boolean;

  @Column({ default: 30000 })
  emailSendTimeout: number;

  @Column()
  organizationId: string;

  @ManyToOne(() => Organization, (organization) => organization.emailSettings)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;
}
