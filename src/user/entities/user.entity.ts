import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Organization } from 'src/entities/organization.entity';
import { USER_TABLE } from 'src/constants/dbTables';

@Entity(USER_TABLE)
@Index(['organizationId'])
@Index(['employmentStatusId'])
@Index(['employeeLevelId'])
@Index(['email'])
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
  @Index()
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
}
