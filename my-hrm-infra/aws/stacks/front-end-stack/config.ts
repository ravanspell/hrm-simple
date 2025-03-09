export interface DomainConfig {
    rootDomain: string;
    appDomain: string;
    apiDomain: string;
}

export interface DeploymentConfig {
    environment: string;
    region: string;
    cloudfront: {
        priceClass: string;
        httpVersion: string;
        defaultTtl: number;
        maxTtl: number;
        minTtl: number;
    };
    certificate: {
        region: string;
    };
    domains: DomainConfig;
    tags: Record<string, string>;
}

// Default configuration values
export const config: DeploymentConfig = {
    environment: "dev",
    region: 'ap-southeast-1',
    cloudfront: {
        priceClass: "PriceClass_100",
        httpVersion: "http2",
        defaultTtl: 3600,
        maxTtl: 86400,
        minTtl: 0,
    },
    certificate: {
        // always us-east-1 for ACM certificates
        region: "us-east-1",
    },
    domains: {
        rootDomain: "mydomain.com",
        appDomain: "app.myhrm.mydomain.com",
        apiDomain: "api.myhrm.mydomain.com",
    },
    tags: {
        Environment: "Development",
        Project: "MyHRM",
        ManagedBy: "CDKTF"
    }
};