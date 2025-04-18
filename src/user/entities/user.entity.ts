import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Organization } from '@/organization/entities/organization.entity';
import { USER_TABLE } from 'src/constants/dbTables';
import { FileMgt } from 'src/file-management/entities/file-management.entity';
import { Folder } from 'src/file-management/entities/folder.entity';
import { Role } from '../../role/entities/role.entity';
import { PushNotificationToken } from '@/notification/entities/push-notification-token.entity';
import { Notification } from '@/notification/entities/notification.entity';

@Entity(USER_TABLE)
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  organizationId: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  password: string | null;

  @Column({ unique: true })
  email: string;

  @Column()
  gender: string;

  @Column({ type: 'timestamp' })
  dateOfBirth: Date;

  @Column()
  @Index()
  employmentStatusId: string;

  @Column()
  @Index()
  employeeLevelId: string;

  // Columns for reset password functionality:
  @Column({ nullable: true })
  resetPasswordToken?: string;

  @Column({ type: 'timestamp', nullable: true })
  resetPasswordExpires?: Date;

  @Column({ type: 'uuid', nullable: true })
  resetRequestId?: string;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate: Date | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @Column()
  createdBy: string;

  @Column()
  updatedBy: string;

  @ManyToOne(() => Organization, (organization) => organization.users, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @OneToMany(() => FileMgt, (file) => file.creator)
  createdFiles: FileMgt[];

  @OneToMany(() => FileMgt, (file) => file.updater)
  updatedFiles: FileMgt[];

  @OneToMany(() => Folder, (folder) => folder.creator)
  createdFolders: Folder[];

  @OneToMany(() => Folder, (folder) => folder.updater)
  updatedFolders: Folder[];

  @ManyToMany(() => Role, (role) => role.userRoles)
  @JoinTable()
  roles: Role[];

  @OneToMany(
    () => PushNotificationToken,
    (pushNotificationToken) => pushNotificationToken.user,
  )
  pushNotificationTokens: PushNotificationToken[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];
}
