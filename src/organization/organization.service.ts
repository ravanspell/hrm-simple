import { Injectable } from '@nestjs/common';
import { OrganizationRepository } from '../repositories/organization.repository';
import { Organization } from '../entities/organization.entity';
import { Transactional } from 'typeorm-transactional';

@Injectable()
export class OrganizationService {
  constructor(private readonly organizationRepository: OrganizationRepository) { }

  @Transactional()
  async create(data: Partial<Organization>) {
    const k = await this.organizationRepository.createAndSave(data);
    // throw new Error('this is a test');
    return k;
  }

  findAll() {
    return this.organizationRepository.findAll();
  }

  // findOne(id: number) {
  //   return this.organizationRepository.findOne(id);
  // }

  update(id: number, data: Partial<Organization>) {
    return this.organizationRepository.update(id, data);
  }

  delete(id: number) {
    return this.organizationRepository.delete(id);
  }
}