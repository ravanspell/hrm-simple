/**
 * S3 config for the frontend bucket
 * 
 * This stack is responsible for creating the S3 bucket and configuring it for the frontend
 * It also creates a CloudFront Origin Access Identity (OAI) and a policy to allow CloudFront to access the S3 bucket
 * 
 */
import { Construct } from "constructs";
import { TerraformOutput } from "cdktf";
import { S3Bucket } from "@cdktf/provider-aws/lib/s3-bucket";
import { S3BucketPolicy } from "@cdktf/provider-aws/lib/s3-bucket-policy";
import { S3BucketWebsiteConfiguration } from "@cdktf/provider-aws/lib/s3-bucket-website-configuration";
import { S3BucketOwnershipControls } from "@cdktf/provider-aws/lib/s3-bucket-ownership-controls";
import { S3BucketPublicAccessBlock } from "@cdktf/provider-aws/lib/s3-bucket-public-access-block";
import { CloudfrontOriginAccessIdentity } from "@cdktf/provider-aws/lib/cloudfront-origin-access-identity";
import { config } from "./config";


export class S3Config extends Construct {
    public readonly bucket: S3Bucket;
    public readonly originAccessIdentity: CloudfrontOriginAccessIdentity;

    constructor(scope: Construct, name: string) {
        super(scope, name);

        // Create S3 bucket for Next.js artifacts
        this.bucket = new S3Bucket(this, "frontend-bucket", {
            bucket: `${config.domains.appDomain}-frontend`,
        });

        // Set bucket ownership controls
        new S3BucketOwnershipControls(this, "bucket-ownership", {
            bucket: this.bucket.id,
            rule: {
                objectOwnership: "BucketOwnerPreferred"
            }
        });

        // Block public access to the bucket
        new S3BucketPublicAccessBlock(this, "bucket-public-access-block", {
            bucket: this.bucket.id,
            blockPublicAcls: true,
            blockPublicPolicy: true,
            ignorePublicAcls: true,
            restrictPublicBuckets: true
        });

        // Configure website settings
        new S3BucketWebsiteConfiguration(this, "bucket-website-config", {
            bucket: this.bucket.id,
            indexDocument: {
                suffix: "index.html"
            },
            errorDocument: {
                key: "404.html"
            }
        });

        // Create CloudFront Origin Access Identity for S3 access
        this.originAccessIdentity = new CloudfrontOriginAccessIdentity(this, "oai", {
            comment: `OAI for ${config.domains.appDomain}`
        });

        // Create S3 bucket policy to allow CloudFront access
        new S3BucketPolicy(this, "bucket-policy", {
            bucket: this.bucket.id,
            policy: JSON.stringify({
                Version: "2012-10-17",
                Statement: [
                    {
                        Effect: "Allow",
                        Principal: {
                            AWS: `arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity ${this.originAccessIdentity.id}`
                        },
                        Action: "s3:GetObject",
                        Resource: `${this.bucket.arn}/*`
                    }
                ]
            })
        });

        // Output
        new TerraformOutput(this, "frontend_bucket_name", {
            value: this.bucket.id
        });
    }
}