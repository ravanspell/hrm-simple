import {
  BadRequestException,
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
  CreateSystemPermissionDto,
} from './dto/dto';
import { UpdatePermissionCategoryDto } from './dto/update-permission-category.dto';
import { UpdateSystemPermissionDto } from './dto/update-system-permission.dto';
import { CreateOrganizationLicensedPermissionDto } from './dto/create-organization-licensed-permission.dto';
import { IsolationLevel, Transactional } from 'typeorm-transactional';
import { AssignUserDirectPermissionDto } from './dto/assign-user-direct-permission.dto';
import { EffectiveUserPermissionsRepository } from './repositories/effective-user-permission.repository';
import {
  PermissionType,
  SystemPermission,
} from './entities/system-permission.entity';
import { PermissionCategory } from './entities/permission-category.entity';

@Injectable()
export class PermissionService {
  constructor(
    private readonly permissionCategoryRepo: PermissionCategoryRepository,
    private readonly systemPermissionRepo: SystemPermissionRepository,
    private readonly orgLicenseRepo: OrganizationLicensedPermissionRepository,
    private readonly userDirectPermissionRepo: UserDirectPermissionRepository,
    private readonly effectiveUserPermissionRepo: EffectiveUserPermissionsRepository,
  ) {}

  /**
   * Generate a standardized permission key by combining type and category key
   * @param type PermissionType (CREATE, READ, UPDATE, DELETE)
   * @param categoryKey Category identifier
   * @returns Formatted permission key (e.g., CREATE:USER_MANAGEMENT)
   */
  generatePermissionKey(type: PermissionType, categoryKey: string): string {
    return categoryKey ? `${type}:${categoryKey}` : type;
  }
  /**
   * Create a new permission category
   * @param permissionCategoryInputData CreatePermissionCategoryDto
   * @param userId User ID who is creating the category
   * @returns Created category
   * @throws BadRequestException if category with same name or key exists
   */
  async createCategory(
    permissionCategoryInputData: CreatePermissionCategoryDto,
  ): Promise<PermissionCategory> {
    const name = permissionCategoryInputData.name.trim();
    const categoryKey = permissionCategoryInputData.categoryKey.trim();

    // Check for existing category with same name
    const existingWithName = await this.permissionCategoryRepo.findByName(name);
    if (existingWithName) {
      throw new BadRequestException('Category with this name already exists');
    }

    // Check for existing category with same key
    const existingWithKey =
      await this.permissionCategoryRepo.findByKey(categoryKey);
    if (existingWithKey) {
      throw new BadRequestException('Category with this key already exists');
    }

    // Prepare category data
    const categoryData = {
      ...permissionCategoryInputData,
      name,
      key: categoryKey,
      description: permissionCategoryInputData.description?.trim(),
      displayOrder: permissionCategoryInputData.displayOrder || 0,
    };

    // Create and save the new category
    return this.permissionCategoryRepo.upsertCategory(categoryData);
  }

  /**
   * Get all permission categories
   * @returns Array of categories
   */
  async getAllCategories() {
    return this.permissionCategoryRepo.find({
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
    const category = await this.permissionCategoryRepo.findById(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (dto.name) {
      const existingWithName = await this.permissionCategoryRepo.findByName(
        dto.name,
      );
      if (existingWithName && existingWithName.id !== id) {
        throw new ConflictException('Category with this name already exists');
      }
    }

    Object.assign(category, dto);
    return this.permissionCategoryRepo.save(category);
  }

  /**
   * Create a new system permission
   * @param permissionInputData CreateSystemPermissionDto containing permission details
   * @param userId ID of the user creating the permission
   * @returns Created system permission
   * @throws ConflictException if permission with same type and category exists
   * @throws BadRequestException if category not found
   */
  async createSystemPermission(
    permissionInputData: CreateSystemPermissionDto,
    userId: string,
  ): Promise<SystemPermission> {
    // Validate category exists
    await this.getPermissionCategoryById(permissionInputData.categoryId);

    // Check for existing permission with same type and category
    const existing = await this.systemPermissionRepo.findOne({
      where: {
        type: permissionInputData.type,
        categoryId: permissionInputData.categoryId,
      },
      relations: ['category'],
    });

    if (existing) {
      throw new BadRequestException(
        `Permission with type '${permissionInputData.type}' already exists in category '${existing.category.name}'`,
      );
    }

    const permission = {
      ...permissionInputData,
      createdBy: userId,
      updatedBy: userId,
    };
    return this.systemPermissionRepo.upsertPermission(permission);
  }

  /**
   * Get system permissions with filtering
   *
   * @param query PermissionQueryDto
   * @returns Object containing permissions and pagination metadata
   */
  async getSystemPermissions(query: PermissionQueryDto) {
    // Calculate pagination parameters
    const skip = (query.page - 1) * query.limit;
    const take = query.limit;

    const [permissions, total] =
      await this.systemPermissionRepo.findByQueryParams(query, skip, take);

    return {
      permissions,
      total,
      page: query.page,
      limit: query.limit,
    };
  }

  /**
   * Get the permission category by id
   *
   * @param id - permission category id
   * @returns PermissionCategory
   */
  async getPermissionCategoryById(id: string): Promise<PermissionCategory> {
    const category = await this.permissionCategoryRepo.findOne({
      where: {
        id,
      },
    });
    if (!category) {
      throw new BadRequestException('Category not found');
    }
    return category;
  }
  /**
   * Update a system permission
   *
   * @param id Permission ID
   * @param dto UpdateSystemPermissionDto
   * @returns Updated permission
   */
  async updateSystemPermission(id: string, dto: UpdateSystemPermissionDto) {
    const permission = await this.systemPermissionRepo.findByIdWithLock(id);
    if (!permission) {
      throw new BadRequestException('Permission not found');
    }

    if (dto?.categoryId) {
      await this.getPermissionCategoryById(dto?.categoryId);
    }

    Object.assign(permission, dto);
    return this.systemPermissionRepo.save(permission);
  }

  /**
   * Create organization licensed permission
   *
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
   *
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
   *
   * @param id License ID
   * @param dto UpdateOrganizationLicensedPermissionDto
   * @returns Updated license
   */
  async updateOrganizationLicense(
    id: string,
    dto: UpdateOrganizationLicensedPermissionDto,
  ) {
    const license = await this.orgLicenseRepo.findOne({ where: { id } });
    if (!license) {
      throw new NotFoundException('License not found');
    }
    Object.assign(license, dto);
    return this.orgLicenseRepo.save(license);
  }

  /**
   * Assign direct permission to user
   *
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
    console.log('newPermissions-->', newPermissions);
    // await this.effectiveUserPermissionRepo.addPermissionsForUsers(newPermissions);
  }
  /**
   * Bulk assign direct permissions to user
   *
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
   *
   * @param id Permission ID
   * @param dto UpdateUserDirectPermissionDto
   * @returns Updated permission
   */
  @Transactional()
  async updateUserDirectPermission(
    id: number,
    dto: UpdateUserDirectPermissionDto,
  ) {
    console.log('updateUserDirectPermission-->', id, dto);
    // const permission = await this.userDirectPermissionRepo.findOne(id);
    // if (!permission) {
    //     throw new NotFoundException('Direct permission not found');
    // }
    // Object.assign(permission, dto);
    // return this.userDirectPermissionRepo.save(permission);
  }
}
