


import { DataTerraformRemoteStateS3, TerraformOutput, TerraformStack } from "cdktf";
import { Construct } from "constructs";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import { IamRole } from "@cdktf/provider-aws/lib/iam-role";
import { IamRolePolicy } from "@cdktf/provider-aws/lib/iam-role-policy";
import { IamInstanceProfile } from "@cdktf/provider-aws/lib/iam-instance-profile";
import { AWS_REGION } from "../../constants";

export class SecurityStack extends TerraformStack {
    public readonly ec2SecurityGroup: SecurityGroup;
    public readonly ec2IamRolePolicy: IamRolePolicy;
    public readonly ec2IamInstanceProfile: IamInstanceProfile;
    public readonly ec2IamRole: IamRole;

    constructor(scope: Construct, id: string) {
        super(scope, id);

        // Get the saved infra info from the terraform state
        const remoteState = new DataTerraformRemoteStateS3(this, "the-remote-state", {
            bucket: 'my-hrm-state-bucket',
            key: 'terraform.tfstate',
            region: AWS_REGION
        });

        const vpcId = remoteState.get("vpc-id").toString();
        console.log("the saved vpcId ---->", vpcId);

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
                    description: "Allow API Gateway traffic"
                },
                {
                    protocol: "-1", // "-1" means all protocols
                    fromPort: 0,
                    toPort: 0,
                    cidrBlocks: ["0.0.0.0/0"], // Allows traffic from any IPv4 address
                    description: "Allow all inbound public traffic"
                }
            ],

            egress: [
                {
                    protocol: "-1",
                    fromPort: 0,
                    toPort: 0,
                    cidrBlocks: ["0.0.0.0/0"],
                    description: "Allow all outbound traffic"
                }
            ]
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
                        "ssm:GetParameter",
                        "ssm:GetParameters"
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

        new TerraformOutput(this, this.ec2IamInstanceProfile.name, { value: this.ec2IamInstanceProfile.id });
        new TerraformOutput(this, this.ec2SecurityGroup.name, { value: this.ec2SecurityGroup.id });
    }
}