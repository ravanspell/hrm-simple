import { Construct } from "constructs";
import { readFileSync } from "fs";
import { Instance } from "@cdktf/provider-aws/lib/instance";
import { DataAwsSsmParameter } from "@cdktf/provider-aws/lib/data-aws-ssm-parameter";
import { join } from "path";
import { NetworkingStack } from "../core/networking";
import { SecurityStack } from "../core/security";

export class EC2Stack extends Construct {
    constructor(
        scope: Construct,
        id: string,
        networkingStack: NetworkingStack,
        securityStack: SecurityStack
    ) {
        super(scope, id);

        // Get the saved infra info from the terraform state
        // const remoteState = new DataTerraformRemoteStateS3(this, "the-remote-state", {
        //     bucket: 'my-hrm-state-bucket',
        //     key: `${S3_STATE_PATH}`,
        //     region: AWS_REGION,
        // });

        const publicSubnetId = networkingStack.publicSubnets[0].id // remoteState.get(`networking-stack.${PUBLIC_SUBNET_ID_KEY}`).toString();
        const instanceProfile = securityStack.ec2IamInstanceProfile.id // remoteState.get(`security-stack.${EC2_INSTANCE_PROFILE_ID_KEY}`).toString();
        const securityGroup = securityStack.ec2SecurityGroup.id // remoteState.get(`security-stack.${EC2_SECURITY_GROUP_ID_KEY}`).toString();

        console.log("the saved subnet id ---->", publicSubnetId);
        console.log("the saved instanceProfile id ---->", instanceProfile);
        console.log("the saved securityGroup id ---->", securityGroup);

        // Retrieve the latest Amazon Linux 2 AMI from SSM Parameter Store
        const amazonLinuxAmi = new DataAwsSsmParameter(this, "amazonLinuxAmi", {
            name: "/aws/service/ami-amazon-linux-latest/amzn2-ami-hvm-x86_64-ebs",
        });

        // Read the user-data.sh file and encode it in Base64
        const userData = readFileSync(join(__dirname, 'user-data.sh'), 'utf-8');
        console.log("userData--->", userData);
        
        new Instance(this, 'my-hrm-ec2-instance', {
            ami: amazonLinuxAmi.value,
            instanceType: 't3.micro',
            iamInstanceProfile: instanceProfile,
            associatePublicIpAddress: true,  // Ensures the instance gets a public IP
            userData: userData,
            vpcSecurityGroupIds: [securityGroup],
            subnetId: publicSubnetId,
            userDataReplaceOnChange: true,
            metadataOptions: {
                httpTokens: "required",
                httpEndpoint: "enabled",
            },
            // Configure the root volume
            rootBlockDevice: {
                volumeSize: 8,              // size in GiB
                volumeType: "gp3",          // gp2 or gp3
                encrypted: true,            // encrypt the volume
                deleteOnTermination: false  // automatically delete volume on instance termination (if true)
            },
            tags: {
                Name: 'primary-ec2-Instance-hrm',
            },
        });
    }
}