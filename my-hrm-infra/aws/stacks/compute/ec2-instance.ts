import { TerraformStack } from "cdktf";
import { Construct } from "constructs";
import { readFileSync } from "fs";
import { Instance } from "@cdktf/provider-aws/lib/instance";
import { IamRole } from "@cdktf/provider-aws/lib/iam-role";
import { IamInstanceProfile } from "@cdktf/provider-aws/lib/iam-instance-profile";

export class EC2Stack extends TerraformStack {
    constructor(scope: Construct, id: string) {
        super(scope, id);

        // Read the user-data.sh file and encode it in Base64
        const userData = readFileSync('./user-data.sh', 'utf-8');

        // Create IAM role for EC2 to access SSM parameters
        const role = new IamRole(this, 'EC2SSMRole', {
            name: 'EC2-SSM-Role',
            assumeRolePolicy: JSON.stringify({
                Version: '2012-10-17',
                Statement: [
                    {
                        Effect: 'Allow',
                        Principal: { Service: 'ec2.amazonaws.com' },
                        Action: 'sts:AssumeRole',
                    },
                ],
            }),
        });

        // Attach policy to IAM role
        new IamInstanceProfile(this, 'EC2InstanceProfile', {
            name: 'EC2-Instance-Profile',
            role: role.name,
        });

        new Instance(this, 'my-hrm-ec2-instance', {
            instanceType: 't3.micro',
            keyName: 'your-key-pair',
            iamInstanceProfile: 'EC2-Instance-Profile',
            userData: Buffer.from(userData).toString('base64'), // Encode UserData in Base64
            vpcSecurityGroupIds: ['sg-xxxxxxxx'], // Replace with your security group
            subnetId: 'subnet-xxxxxxxx', // Replace with your subnet
            tags: {
                Name: 'primary-ec2-Instance-hrm',
            },
        });
    }
}