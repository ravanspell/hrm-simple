import { Module } from '@nestjs/common';
import { CandidateController } from './candidate.controller';
import { CandidateService } from './candidate.service';
import { CandidateRepository } from './candidate.repository';
import { ResumeParserService } from './resume-parser.service';
import { FileManagementModule } from '@/file-management/file-management.module';

@Module({
  imports: [FileManagementModule],
  controllers: [CandidateController],
  providers: [CandidateService, CandidateRepository, ResumeParserService],
  exports: [CandidateService, ResumeParserService],
})
export class CandidateModule {}
