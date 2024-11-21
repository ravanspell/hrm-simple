/**
 * Defines reusable constants for AWS resources.
 */

export const AWS_REGION = process.env.AWS_REGION || 'ap-southeast-1';
export const TERRAFORM_STATE_BUCKET_NAME = process.env.TERRAFORM_STATE_BUCKET_NAME || 'terraform-state-bucket-unique-name';
export const PERMANENT_BUCKET_NAME = process.env.PERMANENT_BUCKET_NAME || 'my-hrm-permanent-bucket'; // Permanent HRM storage bucket
export const DIRTY_BUCKET_NAME = process.env.DIRTY_BUCKET_NAME || 'my-hrm-dirty-bucket'; // Temporary HRM storage bucket
export const IAM_ROLE_NAME = 's3-access-role';
export const IAM_POLICY_NAME = 's3-access-policy';

export const NOTIFICATION_QUEUE = process.env.NOTIFICATION_QUEUE || 'notification-queue';
export const NOTIFICATION_DEAD_LETTER_QUEUE = process.env.NOTIFICATION_DEAD_LETTER_QUEUE || 'notification-dead-letter-queue';