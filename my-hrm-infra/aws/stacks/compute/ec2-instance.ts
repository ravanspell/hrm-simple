import { Construct } from "constructs";
import { readFileSync } from "fs";
import { Instance } from "@cdktf/provider-aws/lib/instance";
import { join } from "path";
import { NetworkingStack } from "../core/networking";
import { SecurityStack } from "../core/security";

export class EC2Stack extends Construct {
    public readonly ec2Instance: Instance;
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

        // Read the user-data.sh file and encode it in Base64
        const userData = readFileSync(join(__dirname, 'user-data.sh'), 'utf-8');
        
        this.ec2Instance = new Instance(this, 'my-hrm-ec2-instance', {
            // Amazon Linux 2023 - Amazon Machine Image (AMI)
            // https://aws.amazon.com/linux/amazon-linux-2023
            ami: 'ami-0474ac020852b87a9',
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
                volumeType: "gp3",          // general purpose 3 (SSD)
                encrypted: true,            // encrypt the volume
                deleteOnTermination: false  // automatically delete volume on instance termination (if true)
            },
            tags: {
                Name: 'primary-ec2-Instance-hrm',
            },
        });
    }
}