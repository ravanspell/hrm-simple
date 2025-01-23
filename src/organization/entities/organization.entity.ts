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
import { Role } from '@/user/entities/role.entity';
import { Scope } from '@/user/entities/scope.entity';
import { ORGANIZATION_TABLE } from 'src/constants/dbTables';
import { EmailSettings } from 'src/email-settings/entities/email-setting.entity';
import { FileMgt } from 'src/file-management/entities/file-management.entity';
import { Folder } from 'src/file-management/entities/folder.entity';
import { User } from 'src/user/entities/user.entity';
import { GeneralSettings } from './general-settings.entity';
import { Notification } from '@/notification/entities/notification.entity';

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => User, (user) => user.organization)
  users: User[];

  @OneToMany(() => Role, (role) => role.organization)
  roles: Role[];

  @OneToMany(() => Scope, (scope) => scope.organization)
  scopes: Scope[];

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
}
