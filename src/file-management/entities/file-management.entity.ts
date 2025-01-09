import { FILE_MGT_TABLE } from 'src/constants/dbTables';
import { Organization } from '@/organization/entities/organization.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Folder } from './folder.entity';

export enum FileStatus {
  ACTIVE = 'ACTIVE',
  DELETED = 'DELETED',
}

@Entity(FILE_MGT_TABLE)
@Index('organization_index', ['organizationId'])
@Index('folder_index', ['folderId'])
@Index('status_index', ['fileStatus'])
@Index('upload_date_index', ['uploadedAt'])
export class FileMgt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  s3ObjectKey: string;

  @Column()
  fileName: string;

  @Column()
  fileSize: number;

  @Column({ nullable: true })
  folderId: string;

  @Column()
  organizationId: string;

  @Column({ type: 'enum', enum: FileStatus, default: FileStatus.ACTIVE })
  fileStatus: FileStatus;

  @Column({ nullable: true })
  deletionTime: Date;

  @Column()
  createdBy: string;

  @Column()
  updatedBy: string;

  @CreateDateColumn()
  uploadedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Organization, (organization) => organization.files)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @ManyToOne(() => Folder, (folder) => folder.files, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'folderId' })
  folder: Folder;

  @ManyToOne(() => User, (user) => user.createdFiles)
  @JoinColumn({ name: 'createdBy' })
  creator: User;

  @ManyToOne(() => User, (user) => user.updatedFiles)
  @JoinColumn({ name: 'updatedBy' })
  updater: User;
}
