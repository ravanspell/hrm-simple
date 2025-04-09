import { Injectable } from '@nestjs/common';
import { DataSource, DeleteResult, Repository } from 'typeorm';
import { Candidate } from './entities/candidate.entity';
import { FilterCandidateDto } from './dto/filter-candidate.dto';

@Injectable()
export class CandidateRepository extends Repository<Candidate> {
  constructor(dataSource: DataSource) {
    super(Candidate, dataSource.createEntityManager());
  }

  async createCandidate(candidate: Partial<Candidate>): Promise<Candidate> {
    const newCandidate = this.create(candidate);
    return await this.save(newCandidate);
  }

  async findAllCandidates(
    filter: FilterCandidateDto,
  ): Promise<[Candidate[], number]> {
    const queryBuilder = this.createQueryBuilder('candidate');

    if (filter.firstName) {
      queryBuilder.andWhere('candidate.firstName ILIKE :firstName', {
        firstName: `%${filter.firstName}%`,
      });
    }

    if (filter.lastName) {
      queryBuilder.andWhere('candidate.lastName ILIKE :lastName', {
        lastName: `%${filter.lastName}%`,
      });
    }

    if (filter.email) {
      queryBuilder.andWhere('candidate.email ILIKE :email', {
        email: `%${filter.email}%`,
      });
    }

    if (filter.currentPosition) {
      queryBuilder.andWhere(
        'candidate.currentPosition ILIKE :currentPosition',
        {
          currentPosition: `%${filter.currentPosition}%`,
        },
      );
    }

    if (filter.expectedPosition) {
      queryBuilder.andWhere(
        'candidate.expectedPosition ILIKE :expectedPosition',
        {
          expectedPosition: `%${filter.expectedPosition}%`,
        },
      );
    }

    if (filter.status) {
      queryBuilder.andWhere('candidate.status = :status', {
        status: filter.status,
      });
    }

    const page = filter.page || 1;
    const limit = filter.limit || 10;
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);
    queryBuilder.orderBy('candidate.createdAt', 'DESC');

    return queryBuilder.getManyAndCount();
  }

  async findCandidateById(id: string): Promise<Candidate> {
    return this.findOne({ where: { id } });
  }

  async updateCandidate(
    id: string,
    candidate: Partial<Candidate>,
  ): Promise<Candidate> {
    await this.update(id, candidate);
    return this.findOne({ where: { id } });
  }

  async removeCandidate(id: string): Promise<DeleteResult> {
    return this.delete(id);
  }
}
