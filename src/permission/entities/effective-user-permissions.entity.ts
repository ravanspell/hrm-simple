import { EFFECTIVE_USER_PERMISSIONS_VIEW } from '@/constants/dbTables';
import {
  Index,
  PrimaryGeneratedColumn,
  ViewEntity,
  ViewColumn,
  DataSource,
} from 'typeorm';
import {
  USER_ROLE_TABLE,
  ROLE_TABLE,
  SYSTEM_PERMISSIONS_TABLE,
  PERMISSION_CATEGORIES_TABLE,
} from '@/constants/dbTables';
import { USER_ROLE_COLUMNS } from '@/role/constants/role-columns';
import {
  EFFECTIVE_USER_PERMISSION_COLUMNS,
  SYSTEM_PERMISSION_COLUMNS,
} from '../constants/table-columns';
import { PERMISSION_CATEGORY_COLUMNS } from '../constants/table-columns';

/**
 * This view is used to get the effective user permissions for a given user and organization.
 * It combines direct permissions, role permissions, and organization licensed permissions.
 * It also includes the origin of the permission (DIRECT, ROLE, or OVERRIDE).
 * The lastUpdated column is the timestamp of the last update to the permission.
 */
@ViewEntity({
  name: EFFECTIVE_USER_PERMISSIONS_VIEW,
  expression: (dataSource: DataSource) =>
    dataSource
      .createQueryBuilder()
      .select('DISTINCT ON (user_id, organization_id, permission)')
      .select('user_id', 'userId')
      .addSelect('organization_id', 'organizationId')
      .addSelect('permission', 'permission')
      .addSelect('origin', 'origin')
      .addSelect('last_updated', 'lastUpdated')
      .from((subQuery) => {
        return subQuery
          .select(
            `COALESCE(ur."${USER_ROLE_COLUMNS.USER_ID}", udp."${USER_ROLE_COLUMNS.USER_ID}")`,
            'user_id',
          )
          .addSelect(
            `COALESCE(ur."${USER_ROLE_COLUMNS.ORGANIZATION_ID}", udp."${USER_ROLE_COLUMNS.ORGANIZATION_ID}")`,
            'organization_id',
          )
          .addSelect(
            `CONCAT(sp."${SYSTEM_PERMISSION_COLUMNS.TYPE}", ':', pc."${PERMISSION_CATEGORY_COLUMNS.KEY}")`,
            'permission',
          )
          .addSelect(
            `CASE
                WHEN udp.id IS NOT NULL THEN 'DIRECT'
                WHEN rp.id IS NOT NULL THEN 'ROLE'
                ELSE 'OVERRIDE'
              END`,
            'origin',
          )
          .addSelect('CURRENT_TIMESTAMP', 'last_updated')
          .from(USER_ROLE_TABLE, 'ur')
          .leftJoin(
            'user_direct_permissions',
            'udp',
            `udp."${USER_ROLE_COLUMNS.USER_ID}" = ur."${USER_ROLE_COLUMNS.USER_ID}" 
               AND udp."${USER_ROLE_COLUMNS.ORGANIZATION_ID}" = ur."${USER_ROLE_COLUMNS.ORGANIZATION_ID}"`,
          )
          .leftJoin(ROLE_TABLE, 'r', `r.id = ur."${USER_ROLE_COLUMNS.ROLE_ID}"`)
          .leftJoin('role_permission', 'rp', `rp."roleId" = r.id`)
          .leftJoin(
            'organization_licensed_permissions',
            'olp',
            'olp.id = rp."organizationLicensedPermissionId" OR olp."systemPermissionId" = udp."systemPermissionId"',
          )
          .leftJoin(
            SYSTEM_PERMISSIONS_TABLE,
            'sp',
            `sp.id = COALESCE(olp."systemPermissionId", udp."systemPermissionId")`,
          )
          .leftJoin(
            PERMISSION_CATEGORIES_TABLE,
            'pc',
            `pc.id = sp."${SYSTEM_PERMISSION_COLUMNS.CATEGORY_ID}"`,
          )
          .where('olp."isActive" = true')
          .andWhere(
            '(olp."validUntil" IS NULL OR olp."validUntil" > CURRENT_TIMESTAMP)',
          );
      }, 'combined_permissions'),
})
@Index('idx_effective_user_permissions', ['userId', 'organizationId'], {
  unique: true,
})
export class EffectiveUserPermission {
  @ViewColumn({
    name: EFFECTIVE_USER_PERMISSION_COLUMNS.ID,
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ViewColumn({
    name: EFFECTIVE_USER_PERMISSION_COLUMNS.USER_ID,
  })
  userId: string;

  @ViewColumn({
    name: EFFECTIVE_USER_PERMISSION_COLUMNS.ORGANIZATION_ID,
  })
  organizationId: string;

  @ViewColumn({
    name: EFFECTIVE_USER_PERMISSION_COLUMNS.PERMISSION,
  })
  permission: string;

  @ViewColumn({
    name: EFFECTIVE_USER_PERMISSION_COLUMNS.ORIGIN,
  })
  origin: 'ROLE' | 'DIRECT' | 'OVERRIDE';

  @ViewColumn({
    name: EFFECTIVE_USER_PERMISSION_COLUMNS.LAST_UPDATED,
  })
  lastUpdated: Date;
}
