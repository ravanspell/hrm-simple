import { TerraformOutput } from "cdktf";
import { Construct } from "constructs";
import { Vpc } from "@cdktf/provider-aws/lib/vpc";
import { Subnet, SubnetConfig } from "@cdktf/provider-aws/lib/subnet";
import { InternetGateway } from "@cdktf/provider-aws/lib/internet-gateway";
import { RouteTable } from "@cdktf/provider-aws/lib/route-table";
import { Route } from "@cdktf/provider-aws/lib/route";
import { PUBLIC_SUBNET_ID_KEY, VPC_ID_KEY } from "../../constants";
import { RouteTableAssociation } from "@cdktf/provider-aws/lib/route-table-association";

export class NetworkingStack extends Construct {
    public readonly vpc: Vpc;
    public readonly internetGateway: InternetGateway;
    public readonly publicSubnets: Subnet[];

    constructor(scope: Construct, id: string) {
        super(scope, id)

        // VPC Configuration
        const vpcCidr = "10.0.0.0/16";

        // Create VPC
        this.vpc = new Vpc(this, "my-hrm-vpc", {
            cidrBlock: vpcCidr,
            enableDnsHostnames: true,
            enableDnsSupport: true,
            tags: {
                Name: "main-vpc"
            }
        });

        // Internet Gateway
        this.internetGateway = new InternetGateway(this, "igw", {
            vpcId: this.vpc.id,
            tags: {
                Name: "my-hrm-main-igw"
            }
        });

        // Create public route table and add a route to the Internet Gateway
        const publicRouteTable = new RouteTable(this, "public-rt", {
            vpcId: this.vpc.id,
            tags: {
                Name: "my-hrm-public-rt"
            }
        });

        // Add route to Internet Gateway
        new Route(this, "public-internet-route", {
            routeTableId: publicRouteTable.id,
            destinationCidrBlock: "0.0.0.0/0",
            gatewayId: this.internetGateway.id
        });

        // Subnet Configurations
        const publicSubnetConfigs: SubnetConfig[] = [
            {
                id: 'ec2-subnet',
                cidrBlock: "10.0.0.0/24",
                vpcId: this.vpc.id
            },
        ];

        // Create public subnets
        this.publicSubnets = publicSubnetConfigs.map((config, index) => {
            return new Subnet(this, `public-subnet-${index}`, {
                vpcId: config.vpcId,
                cidrBlock: config.cidrBlock,
                mapPublicIpOnLaunch: true,
                tags: {
                    Name: `dev-my-hrm-subnet-${index}`
                }
            });
        });

        // Create a route‐table association for the public subnet
        new RouteTableAssociation(this, "public-subnet-assoc", {
            subnetId: this.publicSubnets[0].id,
            routeTableId: publicRouteTable.id,
        });

        console.log("this.vpc.id xxx--->", this.vpc.id);

        new TerraformOutput(this, VPC_ID_KEY, { value: this.vpc.id });
        new TerraformOutput(this, PUBLIC_SUBNET_ID_KEY, { value: this.publicSubnets[0].id });
    }
}