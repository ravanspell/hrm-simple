import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CandidateController } from './candidate.controller';
import { CandidateService } from './candidate.service';
import { CandidateRepository } from './candidate.repository';
import { Candidate } from './entities/candidate.entity';
import { ResumeParserService } from './resume-parser.service';

@Module({
  imports: [TypeOrmModule.forFeature([Candidate])],
  controllers: [CandidateController],
  providers: [CandidateService, CandidateRepository, ResumeParserService],
  exports: [CandidateService, ResumeParserService],
})
export class CandidateModule {}
