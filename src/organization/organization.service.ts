import { Injectable } from '@nestjs/common';
import { Organization } from '../entities/organization.entity';
import { Transactional } from 'typeorm-transactional';
import { OrganizationRepository } from 'src/repository/organization.repository';

@Injectable()
export class OrganizationService {
  constructor(private organizationRepository: OrganizationRepository) {}

  @Transactional()
  async create(data: Partial<Organization>) {
    const org = await this.organizationRepository.createOrganization(data);
    // throw new Error('This is a test error');
    return org;
  }

  findAll() {
    return this.organizationRepository.find();
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
