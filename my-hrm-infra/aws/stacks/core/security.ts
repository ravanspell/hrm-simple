import { TerraformOutput } from "cdktf";
import { Construct } from "constructs";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import { IamRole } from "@cdktf/provider-aws/lib/iam-role";
import { IamRolePolicy } from "@cdktf/provider-aws/lib/iam-role-policy";
import { IamInstanceProfile } from "@cdktf/provider-aws/lib/iam-instance-profile";
import {
    EC2_INSTANCE_PROFILE_ID_KEY,
    EC2_SECURITY_GROUP_ID_KEY,
} from "../../constants";

export class SecurityStack extends Construct {
    public readonly ec2SecurityGroup: SecurityGroup;
    public readonly ec2IamRolePolicy: IamRolePolicy;
    public readonly ec2IamInstanceProfile: IamInstanceProfile;
    public readonly ec2IamRole: IamRole;

    constructor(scope: Construct, id: string, vpcId: string) {
        super(scope, id);

        // EC2 Security Group
        this.ec2SecurityGroup = new SecurityGroup(this, "ec2-sg", {
            name: "ec2-app-sg",
            vpcId: vpcId,

            ingress: [
                {
                    protocol: "tcp",
                    fromPort: 3000,
                    toPort: 3000,
                    cidrBlocks: ["0.0.0.0/0"],
                    description: "Allow inbound traffic to REST API",
                },
                {
                    protocol: "tcp",
                    fromPort: 22,
                    toPort: 22,
                    cidrBlocks: ["0.0.0.0/0"],
                    // For tighter security, consider using your known IP address instead of 0.0.0.0/0
                    description: "Allow SSH access",
                },
            ],

            egress: [
                {
                    protocol: "-1",
                    fromPort: 0,
                    toPort: 0,
                    cidrBlocks: ["0.0.0.0/0"],
                    description: "Allow all outbound traffic",
                },
            ],
        });

        // IAM Role that allows EC2 to assume the role
        this.ec2IamRole = new IamRole(this, "ec2-role", {
            name: "ec2-role",
            assumeRolePolicy: JSON.stringify({
                Version: "2012-10-17",
                Statement: [{
                    Effect: "Allow",
                    Principal: { Service: "ec2.amazonaws.com" },
                    Action: "sts:AssumeRole"
                }]
            }),
        });

        // Attach inline policy to the role for accessing AWS services
        this.ec2IamRolePolicy = new IamRolePolicy(this, "ec2-role-policy", {
            name: "ec2-role-policy",
            role: this.ec2IamRole.name,
            policy: JSON.stringify({
                Version: "2012-10-17",
                Statement: [{
                    Effect: "Allow",
                    Action: [
                        "s3:*",
                        "sns:*",
                        "sqs:*",
                        "cloudwatch:*",
                        "ssm:*",
                    ],
                    Resource: "*"
                }]
            }),
        });

        // Create an Instance Profile to attach to the EC2 instance
        this.ec2IamInstanceProfile = new IamInstanceProfile(this, "ec2-instance-profile", {
            name: "ec2-instance-profile",
            role: this.ec2IamRole.name,
        });

        new TerraformOutput(this, EC2_INSTANCE_PROFILE_ID_KEY, { value: this.ec2IamInstanceProfile.id });
        new TerraformOutput(this, EC2_SECURITY_GROUP_ID_KEY, { value: this.ec2SecurityGroup.id });
    }
}