import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Candidate } from './entities/candidate.entity';
import { FilterCandidateDto } from './dto/filter-candidate.dto';

@Injectable()
export class CandidateRepository {
  constructor(
    @InjectRepository(Candidate)
    private readonly repository: Repository<Candidate>,
  ) {}

  async create(candidate: Partial<Candidate>): Promise<Candidate> {
    const newCandidate = this.repository.create(candidate);
    return await this.repository.save(newCandidate);
  }

  async findAll(filter: FilterCandidateDto): Promise<[Candidate[], number]> {
    const queryBuilder = this.repository.createQueryBuilder('candidate');

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

    return await queryBuilder.getManyAndCount();
  }

  async findOne(id: string): Promise<Candidate> {
    return await this.repository.findOne({ where: { id } });
  }

  async update(id: string, candidate: Partial<Candidate>): Promise<Candidate> {
    await this.repository.update(id, candidate);
    return await this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
