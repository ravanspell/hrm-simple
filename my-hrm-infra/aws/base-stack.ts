import { S3Backend, TerraformStack } from 'cdktf';
import { AwsProvider } from '@cdktf/provider-aws/lib/provider';
import { Construct } from 'constructs';
import { AWS_REGION, S3_STATE_PATH } from './constants';

export class BaseStack extends TerraformStack {
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
            key: S3_STATE_PATH,
            region: AWS_REGION,
            accessKey: '',
            secretKey: ''
        });
    }
}