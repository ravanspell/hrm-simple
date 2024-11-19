import { $Enums } from "@prisma/client";

// file statuses
export const FILE_STATUSES: Record<$Enums.FileStatus, $Enums.FileStatus>= {
    ACTIVE: 'ACTIVE',
    DELETED: 'DELETED'
}