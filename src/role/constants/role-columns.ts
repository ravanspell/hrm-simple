export const ROLE_COLUMNS = {
  ID: 'id',
  ORGANIZATION_ID: 'organizationId',
  NAME: 'name',
  DESCRIPTION: 'description',
  IS_SYSTEM_ROLE: 'isSystemRole',
  CREATED_BY: 'createdBy',
  UPDATED_BY: 'updatedBy',
} as const;

export const ROLE_PERMISSION_COLUMNS = {
  ID: 'id',
  ROLE_ID: 'roleId',
  ORGANIZATION_LICENSED_PERMISSION_ID: 'organizationLicensedPermissionId',
  CREATED_BY: 'createdBy',
  UPDATED_BY: 'updatedBy',
  CREATED_AT: 'createdAt',
  UPDATED_AT: 'updatedAt',
} as const;

export const USER_ROLE_COLUMNS = {
  ID: 'id',
  USER_ID: 'userId',
  ROLE_ID: 'roleId',
  ORGANIZATION_ID: 'organizationId',
} as const;
