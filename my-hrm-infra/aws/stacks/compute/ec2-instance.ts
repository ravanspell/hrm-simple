import { Construct } from "constructs";
import { readFileSync } from "fs";
import { Instance } from "@cdktf/provider-aws/lib/instance";
import { KeyPair } from '@cdktf/provider-aws/lib/key-pair';
import { TlsProvider } from '@cdktf/provider-tls/lib/provider';
import { PrivateKey } from '@cdktf/provider-tls/lib/private-key';
import { join } from "path";
import { NetworkingStack } from "../core/networking";
import { SecurityStack } from "../core/security";
import { File } from "@cdktf/provider-local/lib/file";
import { LocalProvider } from "@cdktf/provider-local/lib/provider";


export class EC2Stack extends Construct {
    public readonly ec2Instance: Instance;
    constructor(
        scope: Construct,
        id: string,
        networkingStack: NetworkingStack,
        securityStack: SecurityStack
    ) {
        super(scope, id);

        /**
         * The TLS provider is used to generate a new RSA private key
         */
        new TlsProvider(this, 'tls', {});
        /**
         * The Local provider is used to save the private key to a local file
         */
        new LocalProvider(this, "local");
        // Generate a new RSA private key
        const privateKey = new PrivateKey(this, 'private_key', {
            algorithm: 'RSA',
            rsaBits: 4096, // Strong key size
        });

        // Save the private key to the key pair
        const keyPair = new KeyPair(this, 'key_pair', {
            keyName: 'instance-key-pair',
            publicKey: privateKey.publicKeyOpenssh,
        });

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
            keyName: keyPair.keyName,
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

        /**
         * Save the private key to a local file
         * check cdktf.out folder for the generated file
         */
        new File(this, "PrivateKeyFile", {
            filename: "./my-private-key.pem",
            content: privateKey.privateKeyPem,
            filePermission: "600",
        });
    }
}