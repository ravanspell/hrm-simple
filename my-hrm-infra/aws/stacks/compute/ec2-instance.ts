import { TerraformStack, DataTerraformRemoteStateS3 } from "cdktf";
import { Construct } from "constructs";
import { readFileSync } from "fs";
import { Instance } from "@cdktf/provider-aws/lib/instance";
import { AWS_REGION } from "../../constants";
import { DataAwsSsmParameter } from "@cdktf/provider-aws/lib/data-aws-ssm-parameter";

export class EC2Stack extends TerraformStack {
    constructor(scope: Construct, id: string) {
        super(scope, id);

        // Get the saved infra info from the terraform state
        const remoteState = new DataTerraformRemoteStateS3(this, "the-remote-state", {
            bucket: 'my-hrm-state-bucket',
            key: 'terraform.tfstate',
            region: AWS_REGION
        });

        const publicSubnetId = remoteState.get("public-subnet-id").toString();
        const instanceProfile = remoteState.get("ec2-instance-profile").toString();
        const securityGroup = remoteState.get("ec2-app-sg").toString();

        console.log("the saved subnet id ---->", publicSubnetId);
        console.log("the saved instanceProfile id ---->", instanceProfile);
        console.log("the saved securityGroup id ---->", securityGroup);

        // Retrieve the latest Amazon Linux 2 AMI from SSM Parameter Store
        const amazonLinuxAmi = new DataAwsSsmParameter(this, "amazonLinuxAmi", {
            name: "/aws/service/ami-amazon-linux-latest/amzn2-ami-hvm-x86_64-ebs",
        });

        // Read the user-data.sh file and encode it in Base64
        const userData = readFileSync('./user-data.sh', 'utf-8');

        new Instance(this, 'my-hrm-ec2-instance', {
            ami: amazonLinuxAmi.value,
            instanceType: 't3.micro',
            iamInstanceProfile: instanceProfile,
            associatePublicIpAddress: true,  // Ensures the instance gets a public IP
            userData: Buffer.from(userData).toString('base64'), // Encode UserData in Base64
            vpcSecurityGroupIds: [securityGroup],
            subnetId: publicSubnetId,
            tags: {
                Name: 'primary-ec2-Instance-hrm',
            },
        });
    }
}