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
