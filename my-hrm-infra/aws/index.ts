/**
 * Aggregates all AWS resources into a single Terraform stack.
 */

import { Construct } from 'constructs';
import { TerraformStack } from 'cdktf';
import { AwsProvider } from "@cdktf/provider-aws/lib/provider";
import { S3Buckets } from './s3-buckets';
import { S3IamPolicies } from './s3-iam-policies';

export class AWSStack extends TerraformStack {
    constructor(scope: Construct, id: string) {
        super(scope, id);

        new AwsProvider(this, "AWS", {
            region: "ap-southeast-1",
            accessKey: '',
            secretKey: '',
            defaultTags: [
                {
                    tags: {
                        environment: 'dev'
                    }
                }
            ]
        });
        // Instantiate S3 Buckets Configuration
        new S3Buckets(this, 'S3Buckets');
        // Instantiate S3 IAM policies Configuration
        new S3IamPolicies(this, 's3-im-policies')
    }
}
