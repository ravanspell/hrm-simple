import { Injectable } from '@nestjs/common';
import { Organization } from '../entities/organization.entity';
import { Transactional } from 'typeorm-transactional';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
  ) {}

  @Transactional()
  async create(data: Partial<Organization>) {
    const newOrganization =  this.organizationRepository.create(data);
    const org = await this.organizationRepository.save(newOrganization);
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