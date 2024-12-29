import { Injectable } from '@nestjs/common';
import { Organization } from '../entities/organization.entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class OrganizationRepository extends BaseRepository<Organization> {
    constructor() {
        super(Organization);
    }

    createAndSave(data: Partial<Organization>) {
        const organization = this.create(data);
        return this.save(organization);
    }

    findAll() {
        return this.find();
    }

    findOne(id: any) {
        return this.findOne(id);
    }

    update(id: number, data: Partial<Organization>) {
        return this.update(id, data);
    }

    delete(id: number) {
        return this.delete(id);
    }
}