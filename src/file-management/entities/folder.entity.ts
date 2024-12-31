import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { FileMgt } from './file-management.entity';
import { FOLDER_TABLE } from 'src/constants/dbTables';
import { Organization } from 'src/entities/organization.entity';
import { User } from 'src/user/entities/user.entity';

@Entity(FOLDER_TABLE)
export class Folder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  parentId: string;

  @Column()
  path: string;

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

  @ManyToOne(() => Organization, (organization) => organization.folders)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @ManyToOne(() => Folder, (folder) => folder.subFolders, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parentId' })
  parentFolder: Folder;

  @OneToMany(() => Folder, (folder) => folder.parentFolder)
  subFolders: Folder[];

  @OneToMany(() => FileMgt, (file) => file.folder)
  files: FileMgt[];

  @ManyToOne(() => User, (user) => user.createdFolders)
  @JoinColumn({ name: 'createdBy' })
  creator: User;

  @ManyToOne(() => User, (user) => user.updatedFolders)
  @JoinColumn({ name: 'updatedBy' })
  updater: User;

  // Virtual properties: these properties are not stored in the database
  fileCount?: number; // Virtual property for the count of files
  subFolderCount?: number; // Virtual property for the count of subfolders
}
