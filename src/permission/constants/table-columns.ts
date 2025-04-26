export const SYSTEM_PERMISSION_COLUMNS = {
  ID: 'id',
  TYPE: 'type',
  CATEGORY_ID: 'categoryId',
  DISPLAY_NAME: 'displayName',
  DESCRIPTION: 'description',
  IS_BASE_PERMISSION: 'isBasePermission',
  CREATED_BY: 'createdBy',
  UPDATED_BY: 'updatedBy',
  CREATED_AT: 'createdAt',
  UPDATED_AT: 'updatedAt',
} as const;

export const PERMISSION_CATEGORY_COLUMNS = {
  ID: 'id',
  NAME: 'name',
  KEY: 'key',
  DESCRIPTION: 'description',
  DISPLAY_ORDER: 'displayOrder',
  CREATED_BY: 'createdBy',
  UPDATED_BY: 'updatedBy',
  CREATED_AT: 'createdAt',
  UPDATED_AT: 'updatedAt',
} as const;

export const USER_DIRECT_PERMISSION_COLUMNS = {
  ID: 'id',
  USER_ID: 'userId',
  ORGANIZATION_ID: 'organizationId',
  VERSION: 'version',
  SYSTEM_PERMISSION_ID: 'systemPermissionId',
  IS_OVERRIDE: 'isOverride',
  CREATED_BY: 'createdBy',
  UPDATED_BY: 'updatedBy',
  CREATED_AT: 'createdAt',
  UPDATED_AT: 'updatedAt',
} as const;

export const ORGANIZATION_LICENSED_PERMISSION_COLUMNS = {
  ID: 'id',
  ORGANIZATION_ID: 'organizationId',
  SYSTEM_PERMISSION_ID: 'systemPermissionId',
  VALID_FROM: 'validFrom',
  VALID_UNTIL: 'validUntil',
  IS_ACTIVE: 'isActive',
  CREATED_BY: 'createdBy',
  UPDATED_BY: 'updatedBy',
  CREATED_AT: 'createdAt',
  UPDATED_AT: 'updatedAt',
} as const;

export const EFFECTIVE_USER_PERMISSION_COLUMNS = {
  ID: 'id',
  USER_ID: 'userId',
  ORGANIZATION_ID: 'organizationId',
  PERMISSION: 'permission',
  ORIGIN: 'origin',
  LAST_UPDATED: 'lastUpdated',
} as const;
