import { EMAIL_SETTINGS_TABLE } from 'src/constants/dbTables';
import { Organization } from '@/organization/entities/organization.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntityWithTenant } from '@/common/entities/base-with-tenant.entity';
import { BASE_ENTITY_COLUMNS } from '@/constants/common';

@Entity(EMAIL_SETTINGS_TABLE)
export class EmailSettings extends BaseEntityWithTenant {
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

  @ManyToOne(() => Organization, (organization) => organization.emailSettings)
  @JoinColumn({ name: BASE_ENTITY_COLUMNS.ORGANIZATION_ID })
  organization: Organization;
}
