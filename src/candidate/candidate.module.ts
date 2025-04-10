import { Module } from '@nestjs/common';
import { CandidateController } from './candidate.controller';
import { CandidateService } from './candidate.service';
import { CandidateRepository } from './candidate.repository';
import { ResumeParserService } from './resume-parser.service';
import { FileManagementModule } from '@/file-management/file-management.module';
import { ResumeParserConsumerService } from './resume-parser-consumer.service';
import { AwsSqsService } from '@/utilities/aws-sqs-service/aws-sqs.service';

@Module({
  imports: [FileManagementModule],
  controllers: [CandidateController],
  providers: [
    AwsSqsService,
    CandidateService,
    CandidateRepository,
    ResumeParserService,
    ResumeParserConsumerService,
  ],
  exports: [CandidateService, ResumeParserService],
})
export class CandidateModule {}
