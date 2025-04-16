import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Role } from '@/role/entities/role.entity';
import { ORGANIZATION_TABLE } from 'src/constants/dbTables';
import { EmailSettings } from 'src/email-settings/entities/email-setting.entity';
import { FileMgt } from 'src/file-management/entities/file-management.entity';
import { Folder } from 'src/file-management/entities/folder.entity';
import { User } from 'src/user/entities/user.entity';
import { GeneralSettings } from './general-settings.entity';
import { Notification } from '@/notification/entities/notification.entity';
import { OrganizationLicensedPermission } from '@/permission/entities/organization-licensed-permission.entity';
import { UserDirectPermission } from '@/permission/entities/user-direct-permission.entity';
import { Job } from '@/job/entities/job.entity';

@Entity(ORGANIZATION_TABLE)
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  logo?: string;

  @Column({
    type: 'bigint',
    default: 0,
    comment: 'User allowed storage in bytes',
  })
  storage: number;

  @Column({
    type: 'bigint',
    default: 0,
    comment: 'Total storage used by the organization in bytes',
  })
  usedStorage: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => User, (user) => user.organization)
  users: User[];

  @OneToMany(() => Role, (role) => role.organization)
  roles: Role[];

  @OneToMany(() => EmailSettings, (emailSettings) => emailSettings.organization)
  emailSettings: EmailSettings[];

  @OneToMany(() => FileMgt, (file) => file.organization)
  files: FileMgt[];

  @OneToMany(() => Folder, (folder) => folder.organization)
  folders: Folder[];

  @OneToOne(
    () => GeneralSettings,
    (generalSettings) => generalSettings.organization,
    { cascade: true },
  )
  @JoinColumn({ name: 'general_settings_id' })
  generalSettings: GeneralSettings;

  @OneToMany(() => Notification, (notification) => notification.organization)
  notifications: Notification[];

  @OneToMany(
    () => OrganizationLicensedPermission,
    (permission) => permission.organization,
  )
  licensedPermissions: OrganizationLicensedPermission[];

  @OneToMany(
    () => UserDirectPermission,
    (permission) => permission.organization,
  )
  userDirectPermissions: UserDirectPermission[];

  @OneToMany(() => Job, (job) => job.organization)
  jobs: Job[];
}
