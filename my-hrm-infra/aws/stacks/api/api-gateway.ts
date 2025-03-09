import { Construct } from "constructs";
import { Apigatewayv2Api } from "@cdktf/provider-aws/lib/apigatewayv2-api";
import { Apigatewayv2Integration } from "@cdktf/provider-aws/lib/apigatewayv2-integration";
import { Apigatewayv2Route } from "@cdktf/provider-aws/lib/apigatewayv2-route";
import { Apigatewayv2Stage } from "@cdktf/provider-aws/lib/apigatewayv2-stage";
// import { LambdaPermission } from "@cdktf/provider-aws/lib/lambda-permission";
import { config } from "../front-end-stack/config";

export interface APIGatewayStackProps {
    lambdaFunctionArn: string;
    // Optional: CloudFront domain name if you want to restrict CORS
    cloudfrontDomainName?: string;
}

export class APIGatewayStack extends Construct {
    private readonly apiGateway: Apigatewayv2Api;
    private readonly apiGatewayv2Integration: Apigatewayv2Integration;
    public readonly apiEndpoint: string;

    constructor(
        scope: Construct,
        id: string,
    ) {
        super(scope, id);

        this.apiGateway = new Apigatewayv2Api(this, "http-api", {
            name: "http-api",
            protocolType: "HTTP",
            corsConfiguration: {
                // If CloudFront domain is provided, restrict CORS to it
                allowOrigins: [config.domains.rootDomain],
                allowMethods: ["GET", "POST", "PUT", "DELETE"],
                allowHeaders: ["*"],
            },
        });

        // Integrate API Gateway with Lambda function
        this.apiGatewayv2Integration = new Apigatewayv2Integration(this, "api-integration", {
            apiId: this.apiGateway.id,
            integrationType: "AWS_PROXY",
            integrationMethod: "POST", // Lambda always uses POST
            payloadFormatVersion: "2.0", // Lambda proxy uses version 2.0
        });

        new Apigatewayv2Route(this, "api-route", {
            apiId: this.apiGateway.id,
            routeKey: "ANY /{proxy+}",
            target: `integrations/${this.apiGatewayv2Integration.id}`,
            authorizationType: "NONE"
        });

        new Apigatewayv2Stage(this, "api-stage", {
            apiId: this.apiGateway.id,
            name: "$default",
            autoDeploy: true,
        });

        // Grant API Gateway permission to invoke the Lambda function
        // new LambdaPermission(this, "lambda-permission", {
        //     functionName: props.lambdaFunctionArn.split(":function:")[1],
        //     action: "lambda:InvokeFunction",
        //     principal: "apigateway.amazonaws.com",
        //     sourceArn: `${this.apiGateway.executionArn}/*/*/{proxy+}`,
        // });

        // Export the API endpoint for use with CloudFront
        this.apiEndpoint = this.apiGateway.apiEndpoint;
    }
}