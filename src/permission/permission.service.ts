import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PermissionCategoryRepository } from './repositories/permission-category.repository';
import { SystemPermissionRepository } from './repositories/system-permission.repository';
import { OrganizationLicensedPermissionRepository } from './repositories/organization-licensed-permission.repository';
import { UserDirectPermissionRepository } from './repositories/user-direct-permission.repository';
import {
  BulkAssignPermissionsDto,
  BulkAssignUserDirectPermissionsDto,
  CreatePermissionCategoryDto,
  PermissionQueryDto,
  UpdateOrganizationLicensedPermissionDto,
  UpdateUserDirectPermissionDto,
} from './dto/dto';
import { UpdatePermissionCategoryDto } from './dto/update-permission-category.dto';
import { UpdateSystemPermissionDto } from './dto/update-system-permission.dto';
import { CreateOrganizationLicensedPermissionDto } from './dto/create-organization-licensed-permission.dto';
import { IsolationLevel, Transactional } from 'typeorm-transactional';
import { AssignUserDirectPermissionDto } from './dto/assign-user-direct-permission.dto';
import { CreateSystemPermissionDto } from './dto/create-system-permission.dto';
import { EffectiveUserPermissionsRepository } from './repositories/effective-user-permission.repository';

@Injectable()
export class PermissionService {
  constructor(
    private categoryRepo: PermissionCategoryRepository,
    private systemPermissionRepo: SystemPermissionRepository,
    private orgLicenseRepo: OrganizationLicensedPermissionRepository,
    private userDirectPermissionRepo: UserDirectPermissionRepository,
    private effectiveUserPermissionRepo: EffectiveUserPermissionsRepository,
  ) {}

  /**
   * Create a new permission category
   * @param dto CreatePermissionCategoryDto
   * @returns Created category
   */
  async createCategory(dto: CreatePermissionCategoryDto) {
    const existing = await this.categoryRepo.findByName(dto.name);
    if (existing) {
      throw new ConflictException('Category with this name already exists');
    }

    const category = this.categoryRepo.create(dto);
    return this.categoryRepo.save(category);
  }

  /**
   * Get all permission categories
   * @returns Array of categories
   */
  async getAllCategories() {
    return this.categoryRepo.find({
      order: { displayOrder: 'ASC' },
    });
  }

  /**
   * Get all permission categories
   * @returns Array of categories
   */
  async getUserEffectivePermissions(userId: string) {
    return this.effectiveUserPermissionRepo.getUserPermissions(userId);
  }

  /**
   * Update a permission category
   * @param id Category ID
   * @param dto UpdatePermissionCategoryDto
   * @returns Updated category
   */

  async updateCategory(id: string, dto: UpdatePermissionCategoryDto) {
    const category = await this.categoryRepo.findByIdWithLock(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (dto.name) {
      const existingWithName = await this.categoryRepo.findByName(dto.name);
      if (existingWithName && existingWithName.id !== id) {
        throw new ConflictException('Category with this name already exists');
      }
    }

    Object.assign(category, dto);
    return this.categoryRepo.save(category);
  }

  /**
   * Create a new system permission
   * Using SERIALIZABLE isolation to prevent permission key conflicts
   * @param dto CreateSystemPermissionDto
   * @returns Created permission
   */
  async createSystemPermission(dto: CreateSystemPermissionDto) {
    // const category = await this.categoryRepo.findOne(dto.categoryId);
    // if (!category) {
    //     throw new NotFoundException('Category not found');
    // }

    const existing = await this.systemPermissionRepo.findOne({
      where: { permissionKey: dto.permissionKey },
    });
    if (existing) {
      throw new ConflictException('Permission with this key already exists');
    }

    const permission = this.systemPermissionRepo.create(dto);
    return this.systemPermissionRepo.save(permission);
  }

  /**
   * Get system permissions with filtering
   * @param query PermissionQueryDto
   * @returns Array of permissions and count
   */
  async getSystemPermissions(query: PermissionQueryDto) {
    return this.systemPermissionRepo.findByQueryParams(query);
  }

  /**
   * Update a system permission
   * @param id Permission ID
   * @param dto UpdateSystemPermissionDto
   * @returns Updated permission
   */

  async updateSystemPermission(id: string, dto: UpdateSystemPermissionDto) {
    const permission = await this.systemPermissionRepo.findByIdWithLock(id);
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    // if (dto.categoryId) {
    //     const category = await this.categoryRepo.findOne(dto.categoryId);
    //     if (!category) {
    //         throw new NotFoundException('Category not found');
    //     }
    // }

    Object.assign(permission, dto);
    return this.systemPermissionRepo.save(permission);
  }

  /**
   * Create organization licensed permission
   * @param dto CreateOrganizationLicensedPermissionDto
   * @returns Created license
   */

  async createOrganizationLicense(
    dto: CreateOrganizationLicensedPermissionDto,
  ) {
    const existing = await this.orgLicenseRepo.findWithLock(
      dto.organizationId,
      dto.systemPermissionId,
    );

    if (existing) {
      throw new ConflictException(
        'Organization already has this permission licensed',
      );
    }

    const license = this.orgLicenseRepo.create(dto);
    return this.orgLicenseRepo.save(license);
  }

  /**
   * Bulk create organization licenses
   * @param dto BulkAssignPermissionsDto
   * @returns Created licenses
   */
  @Transactional({ isolationLevel: IsolationLevel.SERIALIZABLE })
  async bulkCreateOrganizationLicenses(dto: BulkAssignPermissionsDto) {
    const licenses = await Promise.all(
      dto.systemPermissionIds.map(async (systemPermissionId) => {
        const existing = await this.orgLicenseRepo.findWithLock(
          dto.organizationId,
          systemPermissionId,
        );

        if (!existing) {
          return this.orgLicenseRepo.create({
            organizationId: dto.organizationId,
            systemPermissionId,
            validFrom: dto.validFrom,
            validUntil: dto.validUntil,
          });
        }
      }),
    );

    const validLicenses = licenses.filter(Boolean);
    if (validLicenses.length > 0) {
      return this.orgLicenseRepo.save(validLicenses);
    }

    return [];
  }

  /**
   * Update organization license
   * @param id License ID
   * @param dto UpdateOrganizationLicensedPermissionDto
   * @returns Updated license
   */
  async updateOrganizationLicense(
    id: string,
    dto: UpdateOrganizationLicensedPermissionDto,
  ) {
    // const license = await this.orgLicenseRepo.findOne(id);
    // if (!license) {
    //     throw new NotFoundException('License not found');
    // }
    // Object.assign(license, dto);
    // return this.orgLicenseRepo.save(license);
  }

  /**
   * Assign direct permission to user
   * @param dto AssignUserDirectPermissionDto
   * @returns Created direct permission
   */
  @Transactional()
  async assignUserDirectPermission(dto: AssignUserDirectPermissionDto) {
    // Check if organization has this permission licensed
    const orgLicense = await this.orgLicenseRepo.findWithLock(
      dto.organizationId,
      dto.systemPermissionId,
    );

    if (!orgLicense || !orgLicense.isActive) {
      throw new ConflictException(
        'Organization does not have an active license for this permission',
      );
    }

    const existing = await this.userDirectPermissionRepo.findWithLock(
      dto.userId,
      dto.systemPermissionId,
      dto.organizationId,
    );

    if (existing) {
      throw new ConflictException('User already has this direct permission');
    }

    const permission = this.userDirectPermissionRepo.create(dto);
    return this.userDirectPermissionRepo.save(permission);
  }

  /**
   * Updates permissions for a list of users based on role permission changes
   */
  @Transactional()
  async updatePermissionsForUsers(userIds: string[], permissionIds: string[]) {
    if (userIds.length === 0 || permissionIds.length === 0) return;

    // Step 1: Remove only role-based permissions that are no longer assigned
    await this.effectiveUserPermissionRepo.removeUnusedPermissionsForUsers(
      userIds,
      permissionIds,
    );

    // Step 2: Add new permissions assigned by updated roles
    const newPermissions = userIds.flatMap((userId) =>
      permissionIds.map((permissionKey) => ({
        userId,
        permissionKey,
        origin: 'ROLE',
      })),
    );
    // await this.effectiveUserPermissionRepo.addPermissionsForUsers(newPermissions);
  }
  /**
   * Bulk assign direct permissions to user
   * @param dto BulkAssignUserDirectPermissionsDto
   * @returns Created direct permissions
   */
  @Transactional({ isolationLevel: IsolationLevel.SERIALIZABLE })
  async bulkAssignUserDirectPermissions(
    dto: BulkAssignUserDirectPermissionsDto,
  ) {
    const permissions = await Promise.all(
      dto.systemPermissionIds.map(async (systemPermissionId) => {
        // Check org license
        const orgLicense = await this.orgLicenseRepo.findWithLock(
          dto.organizationId,
          systemPermissionId,
        );

        if (!orgLicense || !orgLicense.isActive) {
          return null;
        }

        const existing = await this.userDirectPermissionRepo.findWithLock(
          dto.userId,
          systemPermissionId,
          dto.organizationId,
        );

        if (!existing) {
          return this.userDirectPermissionRepo.create({
            userId: dto.userId,
            systemPermissionId,
            organizationId: dto.organizationId,
            isOverride: dto.isOverride,
          });
        }
      }),
    );

    const validPermissions = permissions.filter(Boolean);
    if (validPermissions.length > 0) {
      return this.userDirectPermissionRepo.save(validPermissions);
    }

    return [];
  }

  /**
   * Update user direct permission
   * @param id Permission ID
   * @param dto UpdateUserDirectPermissionDto
   * @returns Updated permission
   */
  @Transactional()
  async updateUserDirectPermission(
    id: number,
    dto: UpdateUserDirectPermissionDto,
  ) {
    // const permission = await this.userDirectPermissionRepo.findOne(id);
    // if (!permission) {
    //     throw new NotFoundException('Direct permission not found');
    // }
    // Object.assign(permission, dto);
    // return this.userDirectPermissionRepo.save(permission);
  }
}
