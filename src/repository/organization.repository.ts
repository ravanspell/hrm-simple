import { Injectable } from '@nestjs/common';
import { Organization } from '@/organization/entities/organization.entity';
import { Repository, DataSource } from 'typeorm';

@Injectable()
export class OrganizationRepository extends Repository<Organization> {
  constructor(dataSource: DataSource) {
    super(Organization, dataSource.createEntityManager());
  }
  /**
   * Creates a new organization entity and saves it to the database.
   * @param data - Partial data to create a new organization.
   * @returns A promise that resolves to the created Organization entity.
   */
  async createOrganization(data: Partial<Organization>): Promise<Organization> {
    const newOrganization = this.create(data);
    return this.save(newOrganization);
  }

  /**
   * Find organizations with pagination parameters
   *
   * @param skip - Number of records to skip
   * @param take - Number of records to take
   * @returns Promise containing organizations and total count
   */
  async findOrganizationsWithPagination(
    skip: number,
    take: number,
  ): Promise<[Organization[], number]> {
    return this.findAndCount({
      select: {
        id: true,
        name: true,
        description: true,
        logo: true,
        createdAt: true,
        updatedAt: true,
      },
      skip,
      take,
      order: { name: 'ASC' },
    });
  }
}
