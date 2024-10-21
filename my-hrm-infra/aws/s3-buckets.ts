/**
 * Defines AWS S3 bucket configurations using CDKTF.
 *
 * It creates two S3 buckets:
 * 1. my-hrm-dirty-bucket: Temporary storage for HRM files with objects deleted after 2 days.
 * 2. my-hrm-permanent-bucket: Permanent storage for HRM files with versioning, encryption, and lifecycle transitions.
 *
 * References:
 * - AWS S3 Terraform Provider: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/s3_bucket
 */

import { Construct } from 'constructs';
import { S3Bucket } from '@cdktf/provider-aws/lib/s3-bucket';
import { TerraformOutput } from 'cdktf';
import { PERMANENT_BUCKET_NAME, DIRTY_BUCKET_NAME } from './constants';

export class S3Buckets extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);
    /**
     * Create S3 Bucket: my-hrm-dirty-bucket
     *
     * - Purpose: Temporary storage for HRM files.
     * - Lifecycle Rule: Automatically delete objects after 2 days.
     */
    const dirtyBucket = new S3Bucket(this, 'DirtyBucket', {
      bucket: DIRTY_BUCKET_NAME, // 'my-hrm-dirty-bucket'
      acl: 'private',
      serverSideEncryptionConfiguration: {
        rule: {
          applyServerSideEncryptionByDefault: {
            sseAlgorithm: 'AES256',
          },
        },
      },
      lifecycleRule: [{
        enabled: true,
        expiration: {
          days: 2, // Delete objects after 2 days
        },
      }],
      corsRule: [
        {
          allowedHeaders: ['*'],
          allowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
          allowedOrigins: ['*'],
          // This allows the front-end to access the ETag header in the response of a cross-origin request.
          exposeHeaders: ['ETag'],
          // This allows the browser to cache the CORS preflight response for 3000 seconds,
          // reducing the number of preflight requests and improving performance.
          maxAgeSeconds: 3000,
        }
      ]
    });

    // Output the Dirty Bucket Name
    new TerraformOutput(this, 'DirtyBucketName', {
      value: dirtyBucket.bucket,
    });

    /**
     * Create S3 Bucket: my-hrm-permanent-bucket
     *
     * - Purpose: Permanent storage for HRM files.
     * - Versioning: Enabled.
     * - Server-Side Encryption: AES256.
     * - Lifecycle Rule: Transition objects to STANDARD_IA storage class after 29 days.
     */
    const permanentBucket = new S3Bucket(this, 'PermanentBucket', {
      bucket: PERMANENT_BUCKET_NAME, // 'my-hrm-permanent-bucket'
      acl: 'private',
      versioning: {
        enabled: true, // Enable versioning
      },
      serverSideEncryptionConfiguration: {
        rule: {
          applyServerSideEncryptionByDefault: {
            sseAlgorithm: 'AES256',
          },
        },
      },
      lifecycleRule: [{
        enabled: true,
        transition: [
          {
            days: 30, // Can only move S3 object inot standered IA after 29 days
            storageClass: 'STANDARD_IA', // Transition to STANDARD_IA storage class
          },
        ]
      },
      {
        enabled: true,
        expiration: {
          days: 120, // Delete after 4 months (approximately 120 days)
        },
        tags: {
          fileStatus: 'DELETED', // Objects tagged with 'fileStatus=DELETE' will be deleted after 120 days
        },
      }],
    });

    // Output the Permanent Bucket Name
    new TerraformOutput(this, 'PermanentBucketName', {
      value: permanentBucket.bucket,
    });
  }
}
