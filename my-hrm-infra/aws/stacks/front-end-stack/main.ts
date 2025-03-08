import { Construct } from "constructs";
import { TerraformOutput } from "cdktf";
import { S3Config } from "./s3-config";
import { CdnNetworking } from "./networking-config";
import { config } from "./config";
import { BaseStack } from "../../base-stack";

export class FrontendDeploymentStack extends BaseStack {
    public readonly s3Config: S3Config;
    public readonly cdnNetworking: CdnNetworking;

    constructor(scope: Construct, name: string) {
        super(scope, name);

        // Create S3 configuration construct
        this.s3Config = new S3Config(this, "s3-config");

        // Create CDN networking construct
        this.cdnNetworking = new CdnNetworking(
            this,
            "cdn-networking",
            this.s3Config
        );

        // Frontend stack outputs
        new TerraformOutput(this, "app_url", {
            value: `https://${config.domains.appDomain}`
        });

        new TerraformOutput(this, "api_url", {
            value: `https://${config.domains.apiDomain}`
        });

        // General deployment info
        new TerraformOutput(this, "deployment_info", {
            value: {
                environment: config.environment,
                region: config.region,
                domains: config.domains
            }
        });
    }
}