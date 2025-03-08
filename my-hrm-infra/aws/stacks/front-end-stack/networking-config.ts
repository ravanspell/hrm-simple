import { Construct } from "constructs";
import { TerraformOutput } from "cdktf";
import { CloudfrontDistribution } from "@cdktf/provider-aws/lib/cloudfront-distribution";
import { AcmCertificate } from "@cdktf/provider-aws/lib/acm-certificate";
import { AcmCertificateValidation } from "@cdktf/provider-aws/lib/acm-certificate-validation";
import { S3Config } from "./s3-config";
import { AwsProvider } from "@cdktf/provider-aws/lib/provider";
import { config } from "./config";

export class CdnNetworking extends Construct {
    public readonly distribution: CloudfrontDistribution;
    public readonly certificate: AcmCertificate;
    private readonly acmCertificateProvider: AwsProvider;

    constructor(scope: Construct, name: string, s3Config: S3Config) {
        super(scope, name);
        /**
         * The ACM certificates should only created in us-east-1
         * therfore, we need to create a new provider for the ACM certificate 
         * and pass it to the ACM certificate constructor
         */
        this.acmCertificateProvider = new AwsProvider(this, 'AWS', {
            region: config.certificate.region,
            accessKey: '',
            secretKey: '',
        })
        // Create ACM Certificate for app and API domains
        this.certificate = new AcmCertificate(this, "frontend-cert", {
            domainName: config.domains.appDomain,
            subjectAlternativeNames: [config.domains.apiDomain],
            validationMethod: "DNS",
            provider: this.acmCertificateProvider
        });

        // Since we're using Namecheap DNS, we need to output the validation records
        // so they can be manually added to Namecheap DNS settings
        for (const [index, dvo] of Object.entries(this.certificate.domainValidationOptions)) {
            new TerraformOutput(this, `cert-validation-record-${index}`, {
                value: {
                    name: dvo.resourceRecordName,
                    type: dvo.resourceRecordType,
                    value: dvo.resourceRecordValue
                }
            });
        };

        // For validation, we'll use the certificate directly without validation record references
        // Note: The certificate won't be considered valid until you manually add the DNS records in Namecheap
        const certificateValidation = new AcmCertificateValidation(this, "cert-validation", {
            certificateArn: this.certificate.arn,
            // No validationRecordFqdns specified since we're using external DNS
            provider: this.acmCertificateProvider,
        });

        // Create CloudFront distribution
        this.distribution = new CloudfrontDistribution(this, "cdn-distribution", {
            enabled: true,
            isIpv6Enabled: true,
            httpVersion: config.cloudfront.httpVersion,
            priceClass: config.cloudfront.priceClass,
            aliases: [config.domains.appDomain, config.domains.apiDomain],

            // Default behavior for S3
            defaultCacheBehavior: {
                targetOriginId: "S3Origin",
                allowedMethods: ["GET", "HEAD", "OPTIONS"],
                cachedMethods: ["GET", "HEAD"],
                forwardedValues: {
                    queryString: false,
                    cookies: { forward: "none" }
                },
                viewerProtocolPolicy: "redirect-to-https",
                minTtl: config.cloudfront.minTtl,
                defaultTtl: config.cloudfront.defaultTtl,
                maxTtl: config.cloudfront.maxTtl,
                compress: true
            },

            // API Gateway behavior - No Caching
            orderedCacheBehavior: [
                {
                    pathPattern: "/api/*",
                    targetOriginId: "APIGateway",
                    allowedMethods: [
                        "DELETE",
                        "GET",
                        "HEAD",
                        "OPTIONS",
                        "PATCH",
                        "POST",
                        "PUT"
                    ],
                    cachedMethods: ["GET", "HEAD"],
                    forwardedValues: {
                        queryString: true,
                        headers: [
                            "Authorization",
                            "Host",
                            "User-Agent",
                            "X-Api-Key",
                            "X-Amz-Date",
                            "X-Amz-Security-Token",
                            "X-RequestId"
                        ],
                        cookies: { forward: "all" }
                    },
                    minTtl: 0,
                    defaultTtl: 0,
                    maxTtl: 0,
                    compress: true,
                    viewerProtocolPolicy: "https-only"
                }
            ],

            // Origins configuration
            origin: [
                // S3 Origin
                {
                    originId: "S3Origin",
                    domainName: s3Config.bucket.bucketRegionalDomainName,
                    s3OriginConfig: {
                        originAccessIdentity: s3Config.originAccessIdentity.cloudfrontAccessIdentityPath
                    }
                },
                // API Gateway Origin
                {
                    originId: "APIGateway",
                    domainName: config.domains.apiDomain,
                    customOriginConfig: {
                        httpPort: 80,
                        httpsPort: 443,
                        originProtocolPolicy: "https-only",
                        originSslProtocols: ["TLSv1.2"]
                    }
                }
            ],

            // SSL Certificate configuration
            viewerCertificate: {
                acmCertificateArn: certificateValidation.certificateArn,
                sslSupportMethod: "sni-only",
                minimumProtocolVersion: "TLSv1.2_2021"
            },

            restrictions: {
                geoRestriction: {
                    restrictionType: "none"
                }
            }
        });

        // Outputs
        new TerraformOutput(this, "cloudfront_distribution_id", {
            value: this.distribution.id
        });

        new TerraformOutput(this, "cloudfront_domain_name", {
            value: this.distribution.domainName
        });

        // Since we're using Namecheap, we'll output the CloudFront domain name
        // so you can manually configure CNAME records in Namecheap
        new TerraformOutput(this, "app_domain_cname_record", {
            value: `Configure in Namecheap: CNAME record for ${config.domains.appDomain} pointing to ${this.distribution.domainName}`
        });

        new TerraformOutput(this, "api_domain_cname_record", {
            value: `Configure in Namecheap: CNAME record for ${config.domains.apiDomain} pointing to ${this.distribution.domainName}`
        });
    }
}