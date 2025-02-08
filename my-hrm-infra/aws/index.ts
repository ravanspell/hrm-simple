/**
 * Aggregates all AWS resources into a single Terraform stack.
 */
import { Construct } from 'constructs';
import { S3Backend, TerraformStack } from 'cdktf';
import { AwsProvider } from '@cdktf/provider-aws/lib/provider';
import { S3Buckets } from './s3-buckets';
import { S3IamPolicies } from './s3-iam-policies';
import { AWS_REGION } from './constants';
import { SQSQueues } from './sqs-queues';
import { NetworkingStack } from './stacks/core/networking';
import { SecurityStack } from './stacks/core/security';
import { EC2Stack } from './stacks/compute/ec2-instance';

export class AWSStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

        new AwsProvider(this, 'AWS', {
            region: AWS_REGION,
            accessKey: '',
            secretKey: '',
            defaultTags: [
                {
                    tags: {
                        environment: 'dev',
                    },
                },
            ],
        });
        // S3 Backend for state storage
        // Terraform state in an S3 bucket and,
        // DynamoDB for state locking to ensure only one process modifies the state at a time.
        // this state locking is optional.
        new S3Backend(this, {
            bucket: 'my-hrm-state-bucket',
            key: 'terraform.tfstate',
            region: AWS_REGION,
            accessKey: '',
            secretKey: ''
        });
        
        new NetworkingStack(this, 'networking-stack');

        new SecurityStack(this, 'security-stack');

        new EC2Stack(this, 'ec2-stack');

        // Instantiate S3 Buckets Configuration
        new S3Buckets(this, 'S3Buckets');
        // Instantiate S3 IAM policies Configuration
        new S3IamPolicies(this, 's3-im-policies');
        // create notification queues
        new SQSQueues(this, 'notificationQueues')
    }
}
