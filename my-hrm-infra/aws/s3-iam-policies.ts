/**
 * Defines IAM policies for AWS S3 buckets using CDKTF.
 *
 * - DirtyBucketPolicy: Permissions for my-hrm-dirty-bucket.
 * - PermanentBucketPolicy: Permissions for my-hrm-permanent-bucket.
 *
 * References:
 * - AWS IAM Policy: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_policy
 */

import { Construct } from 'constructs';
import { IamPolicy } from '@cdktf/provider-aws/lib/iam-policy';
import { PERMANENT_BUCKET_NAME, DIRTY_BUCKET_NAME } from './constants';

export class S3IamPolicies extends Construct {
  public readonly dirtyBucketPolicy: IamPolicy;
  public readonly permanentBucketPolicy: IamPolicy;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    /**
     * IAM Policy for my-hrm-dirty-bucket
     * ----------------------------------
     *
     * Permissions:
     * - s3:PutObject
     * - s3:GetObject
     * - s3:ListBucket
     *
     * - Purpose: Allow applications or users to upload, retrieve, and list objects in the dirty bucket.
     */
    this.dirtyBucketPolicy = new IamPolicy(this, 'DirtyBucketPolicy', {
      name: 'DirtyBucketPolicy',
      description: 'IAM policy for accessing my-hrm-dirty-bucket',
      policy: JSON.stringify({
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Action: ['s3:PutObject', 's3:GetObject', 's3:ListBucket'],
            Resource: [
              `arn:aws:s3:::${DIRTY_BUCKET_NAME}`,
              `arn:aws:s3:::${DIRTY_BUCKET_NAME}/*`,
            ],
          },
        ],
      }),
    });

    /**
     * IAM Policy for my-hrm-permanent-bucket
     * --------------------------------------
     *
     * Permissions:
     * - s3:PutObject
     * - s3:GetObject
     * - s3:DeleteObject
     * - s3:ListBucket
     * - s3:ListBucketVersions
     * - s3:GetBucketVersioning
     *
     * - Purpose: Allow applications or users to manage objects and versions in the permanent bucket.
     */
    this.permanentBucketPolicy = new IamPolicy(this, 'PermanentBucketPolicy', {
      name: 'PermanentBucketPolicy',
      description: 'IAM policy for accessing my-hrm-permanent-bucket',
      policy: JSON.stringify({
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Action: [
              's3:PutObject',
              's3:GetObject',
              's3:DeleteObject',
              's3:ListBucket',
              's3:ListBucketVersions',
              's3:GetBucketVersioning',
            ],
            Resource: [
              `arn:aws:s3:::${PERMANENT_BUCKET_NAME}`,
              `arn:aws:s3:::${PERMANENT_BUCKET_NAME}/*`,
            ],
          },
        ],
      }),
    });
  }
}
