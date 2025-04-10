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

@Entity(CANDIDATE_TABLE)
@Index('idx_candidate_first_name', ['firstName'])
@Index('idx_candidate_last_name', ['lastName'])
@Index('idx_candidate_email', ['email'])
@Index('idx_candidate_status', ['status'])
@Index('idx_candidate_created_at', ['createdAt'])
export class Candidate {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'The unique identifier of the candidate' })
  id: string;

  @Column({ length: 100 })
  @ApiProperty({ description: 'First name of the candidate' })
  firstName: string;

  @Column({ length: 100, nullable: true })
  @ApiProperty({ description: 'Last name of the candidate' })
  lastName: string;

  @Column({ unique: true, length: 255, nullable: true })
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

  @Column({ type: 'jsonb', nullable: true })
  @ApiProperty({
    description: 'Resume/CV content of the candidate in JSON format',
    required: false,
  })
  resume: Record<string, any>;

  @Column({
    default: 'REVIEWING',
    length: 20,
    enum: [
      'PENDING',
      'REVIEWING',
      'INTERVIEWED',
      'OFFERED',
      'REJECTED',
      'HIRED',
      'IDLE',
      'PROCESSING',
    ],
  })
  @ApiProperty({
    description: 'Current status of the candidate application',
    enum: [
      'PENDING',
      'REVIEWING',
      'PROCESSING',
      'INTERVIEWED',
      'OFFERED',
      'REJECTED',
      'HIRED',
      'IDLE',
    ],
    default: 'REVIEWING',
  })
  status: string;

  @CreateDateColumn()
  @ApiProperty({ description: 'Timestamp when the candidate was created' })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'Timestamp when the candidate was last updated' })
  updatedAt: Date;
}
