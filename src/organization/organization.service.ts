import { Injectable } from '@nestjs/common';
import { Organization } from './entities/organization.entity';
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

  async getAllOrganizations(page: number = 1, limit: number = 10) {
    return this.organizationRepository.getOrganizations(page, limit);
  }

  /**
   * Get an organization by its ID.
   * @param id - The ID of the organization to retrieve.
   * @returns The organization with the specified ID.
   */
  async getOrganizationById(id: string): Promise<Organization> {
    return this.organizationRepository.findOne({ where: { id } });
  }

  update(id: number, data: Partial<Organization>) {
    return this.organizationRepository.update(id, data);
  }

  delete(id: number) {
    return this.organizationRepository.delete(id);
  }
}
