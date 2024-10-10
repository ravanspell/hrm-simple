// multi tenancy poc skelton
import { Request } from 'express';

interface User {
    id: number;
    name: string;
}

interface Organization {
    id: number;
    name: string;
}

export interface RequestWithTenant extends Request {
    user: User;
    organization: Organization;
}

export type WithOrganization<T extends object> = T & {
    organizationId: number;
};