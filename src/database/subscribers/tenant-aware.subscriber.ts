import {
  EventSubscriber,
  EntitySubscriberInterface,
  InsertEvent,
} from 'typeorm';
import { Injectable } from '@nestjs/common';
import { AsyncStorageService } from '@/utilities/async-storage-service/async-storage.service';
import { USER_CONTEXT_KEY } from '@/constants/common';
import { User } from '@/user/entities/user.entity';
import { BaseEntityWithTenant } from '@/common/entities/base-with-tenant.entity';

/**
 * Subscriber to set the organizationId field automatically
 * for entities that are tenant aware
 *
 * @example
 * @Entity()
 * class User extends BaseEntityWithTenant
 */
@Injectable()
@EventSubscriber()
export class TenantAwareSubscriber implements EntitySubscriberInterface {
  private readonly asyncStorageService = AsyncStorageService.getInstance();

  /**
   * Set the organizationId field automatically
   *
   * @param entity
   * @param currentOrganizationId
   */
  setOrganizationId(entity: any, currentOrganizationId: string) {
    if (entity instanceof BaseEntityWithTenant) {
      entity.organizationId = currentOrganizationId;
    }
  }

  /**
   * Set the organizationId field automatically
   * @param event
   */
  beforeInsert(event: InsertEvent<any>) {
    const currentUser = this.asyncStorageService.get<User>(USER_CONTEXT_KEY);
    if (currentUser?.organizationId) {
      this.setOrganizationId(event.entity, currentUser.organizationId);
    }
  }
}
