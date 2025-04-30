import {
  EventSubscriber,
  EntitySubscriberInterface,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';
import { Injectable } from '@nestjs/common';
import { AsyncStorageService } from '@/utilities/async-storage-service/async-storage.service';
import { USER_CONTEXT_KEY } from '@/constants/common';
import { User } from '@/user/entities/user.entity';
import { BaseEntityWithTenant } from '@/common/entities/base-with-tenant.entity';

@Injectable()
@EventSubscriber()
export class AuditMetadataSubscriber implements EntitySubscriberInterface {
  private readonly asyncStorageService = AsyncStorageService.getInstance();

  // set the createdBy field automatically
  setCreatedBy(entity: any, currentUserId: string) {
    if (entity instanceof BaseEntityWithTenant) {
      entity.createdBy = currentUserId;
    }
  }

  // set the updatedBy field automatically
  setUpdatedBy(entity: any, currentUserId: string) {
    if (entity instanceof BaseEntityWithTenant) {
      entity.updatedBy = currentUserId;
    }
  }

  /**
   * Set the createdBy and updatedBy fields automatically
   * @param event
   */
  beforeInsert(event: InsertEvent<any>) {
    const currentUser = this.asyncStorageService.get<User>(USER_CONTEXT_KEY);
    if (currentUser?.id) {
      this.setCreatedBy(event.entity, currentUser.id);
      this.setUpdatedBy(event.entity, currentUser.id);
    }
  }

  /**
   * Set the updatedBy field automatically
   * @param event
   */
  beforeUpdate(event: UpdateEvent<any>) {
    const currentUser = this.asyncStorageService.get<User>(USER_CONTEXT_KEY);
    if (currentUser?.id) {
      this.setUpdatedBy(event.entity, currentUser.id);
    }
  }
}
