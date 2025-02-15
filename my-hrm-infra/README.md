
#AWS Infrastructure Organization

infra/
├── stacks/
│   ├── core/
│   │   ├── networking/            # VPC, subnets, and endpoints
│   │   ├── security/              # IAM roles, security groups, bucket policies
│   ├── compute/
│   │   ├── ec2-instance/          # EC2 instance with MySQL installed
│   │   ├── ebs/                   # EBS volume for EC2
│   ├── storage/
│   │   ├── s3/                    # S3 buckets (temporary and permanent)
│   ├── api/
│   │   ├── api-gateway/           # API Gateway with VPC Link
│   ├── messaging/
│   │   ├── sqs/                   # SQS queue and dead-letter queue
│   ├── monitoring/
│   │   ├── cloudwatch/            # CloudWatch alarms and logging
│── cdktf.json                      # CDKTF project config
│── main.ts                         # Entry point to define stacks