import { ORGANIZATION_TABLE } from 'src/constants/dbTables';
import { EmailSettings } from 'src/email-settings/entities/email-setting.entity';
import { FileMgt } from 'src/file-management/entities/file-management.entity';
import { Folder } from 'src/file-management/entities/folder.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

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

  @OneToMany(() => EmailSettings, (emailSettings) => emailSettings.organization)
  emailSettings: EmailSettings[];

  @OneToMany(() => FileMgt, (file) => file.organization)
  files: FileMgt[];

  @OneToMany(() => Folder, (folder) => folder.organization)
  folders: Folder[];
}
