import { User, Organization } from '@prisma/client';
import { Request } from 'express';

export interface RequestWithTenant extends Request {
  user: User;
  organization: Organization;
}
