/**
 * Aggregates all AWS resources into a single Terraform stack.
 */
import { Construct } from 'constructs';
import { S3Buckets } from './s3-buckets';
import { S3IamPolicies } from './s3-iam-policies';
import { SQSQueues } from './sqs-queues';
import { NetworkingStack } from './stacks/core/networking';
import { SecurityStack } from './stacks/core/security';
import { EC2Stack } from './stacks/compute/ec2-instance';
import { BaseStack } from './base-stack';
// import { APIGatewayStack } from './stacks/api/api-gateway';
// import { FrontendDeploymentStack } from './stacks/front-end-stack/main';

export class AWSStack extends BaseStack {
    constructor(scope: Construct, id: string) {
        super(scope, id);

        // new FrontendDeploymentStack(this, "frontend-deployment-stack");
        
        const networkingStack = new NetworkingStack(this, 'networking-stack');

        const securityStack = new SecurityStack(this, 'security-stack', networkingStack.vpc.id);

        new EC2Stack(this, 'ec2-stack', networkingStack, securityStack);

        // new APIGatewayStack(this, 'api-gateway-stack');

        // Instantiate S3 Buckets Configuration
        new S3Buckets(this, 'S3Buckets');
        // Instantiate S3 IAM policies Configuration
        new S3IamPolicies(this, 's3-im-policies');
        // create notification queues
        new SQSQueues(this, 'notificationQueues')
    }
}
