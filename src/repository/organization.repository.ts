/**
 * OrganizationRepository is a custom repository for the Organization entity.
 * It extends the TypeORM Repository class and provides additional
 * methods for creating and querying the Organization entity.
 */
import { Injectable } from '@nestjs/common';
import { Organization } from 'src/entities/organization.entity';
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
    createOrganization(data: Partial<Organization>): Promise<Organization> {
        const newOrganization = this.create(data);
        return this.save(newOrganization);
    }
}