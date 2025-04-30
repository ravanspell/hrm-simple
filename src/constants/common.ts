/**
 * define API versions for indicate versions
 * for same API
 */
export const API_VERSION = {
  V1: '1',
};

/**
 * Environment types supported by the application
 */
export const ENVIRONMENT = {
  LOCAL: 'local',
  DEVELOPMENT: 'dev',
} as const;

export const BASE_ENTITY_COLUMNS = {
  ID: 'id',
  CREATED_AT: 'createdAt',
  UPDATED_AT: 'updatedAt',
  CREATED_BY: 'createdBy',
  UPDATED_BY: 'updatedBy',
  ORGANIZATION_ID: 'organizationId',
} as const;

// context keys
export const USER_CONTEXT_KEY = 'currentUser';
