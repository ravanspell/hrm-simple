/**
 * Defines reusable constants for AWS resources.
 */

export const AWS_REGION = process.env.AWS_REGION || 'us-west-2';
export const TERRAFORM_STATE_BUCKET_NAME = process.env.TERRAFORM_STATE_BUCKET_NAME || 'terraform-state-bucket-unique-name';
export const PERMANENT_BUCKET_NAME = process.env.PERMANENT_BUCKET_NAME || 'my-hrm-permanent-bucket'; // Permanent HRM storage bucket
export const DIRTY_BUCKET_NAME = process.env.DIRTY_BUCKET_NAME || 'my-hrm-dirty-bucket'; // Temporary HRM storage bucket
export const IAM_ROLE_NAME = 's3-access-role';
export const IAM_POLICY_NAME = 's3-access-policy';