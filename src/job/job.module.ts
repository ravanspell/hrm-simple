import { Module } from '@nestjs/common';
import { JobService } from './job.service';
import { JobController } from './job.controller';
import { JobRepository } from '@/repository/job.repository';

@Module({
  controllers: [JobController],
  providers: [JobService, JobRepository],
  exports: [JobService],
})
export class JobModule {}
