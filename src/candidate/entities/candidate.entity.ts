import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { CANDIDATE_TABLE } from '@/constants/dbTables';

/**
 * Entity representing a candidate in the hiring process
 * Uses PostgreSQL-specific features for optimal performance
 */
@Entity(CANDIDATE_TABLE)
@Index('idx_candidate_first_name', ['firstName'])
@Index('idx_candidate_last_name', ['lastName'])
@Index('idx_candidate_email', ['email'])
@Index('idx_candidate_current_position', ['currentPosition'])
@Index('idx_candidate_expected_position', ['expectedPosition'])
@Index('idx_candidate_status', ['status'])
@Index('idx_candidate_created_at', ['createdAt'])
export class Candidate {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'The unique identifier of the candidate' })
  id: string;

  @Column({ length: 100 })
  @ApiProperty({ description: 'First name of the candidate' })
  firstName: string;

  @Column({ length: 100 })
  @ApiProperty({ description: 'Last name of the candidate' })
  lastName: string;

  @Column({ unique: true, length: 255 })
  @ApiProperty({ description: 'Email address of the candidate' })
  email: string;

  @Column({ nullable: true, length: 20 })
  @ApiProperty({
    description: 'Phone number of the candidate',
    required: false,
  })
  phone: string;

  @Column({ nullable: true, length: 100 })
  @ApiProperty({
    description: 'Current position of the candidate',
    required: false,
  })
  currentPosition: string;

  @Column({ nullable: true, length: 100 })
  @ApiProperty({
    description: 'Expected position the candidate is applying for',
    required: false,
  })
  expectedPosition: string;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({
    description: 'Resume/CV content of the candidate',
    required: false,
  })
  resume: string;

  @Column({ nullable: true, length: 255 })
  @ApiProperty({
    description: 'LinkedIn profile URL of the candidate',
    required: false,
  })
  linkedInUrl: string;

  @Column({
    default: 'PENDING',
    length: 20,
    enum: [
      'PENDING',
      'REVIEWING',
      'INTERVIEWED',
      'OFFERED',
      'REJECTED',
      'HIRED',
    ],
  })
  @ApiProperty({
    description: 'Current status of the candidate application',
    enum: [
      'PENDING',
      'REVIEWING',
      'INTERVIEWED',
      'OFFERED',
      'REJECTED',
      'HIRED',
    ],
  })
  status: string;

  @Column({ type: 'jsonb', nullable: true })
  @ApiProperty({
    description: 'Additional metadata about the candidate',
    required: false,
  })
  metadata: Record<string, any>;

  @CreateDateColumn()
  @ApiProperty({ description: 'Timestamp when the candidate was created' })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'Timestamp when the candidate was last updated' })
  updatedAt: Date;
}
