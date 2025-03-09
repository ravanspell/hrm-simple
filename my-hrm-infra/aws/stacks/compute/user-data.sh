#!/bin/bash

: '
VERIFICATION INSTRUCTIONS
=======================

To verify if this script has executed properly, follow these steps:

1. SSH into the EC2 instance and check the logs:
   $ cat /var/log/user-data.log
   $ cat /var/log/cloud-init-output.log

2. Check cloud-init status:
   $ cloud-init status

3. For detailed cloud-init logs:
   $ cat /var/log/cloud-init.log
'

# Enable logging of the user data script execution
exec > >(tee /var/log/user-data.log | logger -t user-data -s 2>/dev/console) 2>&1

echo "Starting user data script execution..."

# change execution dir into ec2 user dir
cd /home/ec2-user/

# Update package repository and upgrade system packages
sudo dnf update -y

# Install necessary utilities
sudo dnf install -y unzip git

# Install Node.js version 20 using NodeSource
if ! curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -; then
    echo "Failed to set up NodeSource for Node.js"
    exit 1
fi
if ! sudo dnf install -y nodejs; then
    echo "Failed to install Node.js"
    exit 1
fi

# Install PM2 globally
if ! sudo npm install -g pm2; then
    echo "Failed to install PM2"
    exit 1
fi

# Ensure PM2 starts on boot for ec2-user
if ! pm2 startup systemd -u ec2-user --hp /home/ec2-user; then
    echo "Failed to set up PM2 startup"
    exit 1
fi

# Create a dedicated directory for the api
mkdir -p api

# Change ownership to ec2-user
sudo chown -R ec2-user:ec2-user api

# change the dir to navigate to the directory
cd api

# Create a new repository file for MariaDB
sudo tee /etc/yum.repos.d/mariadb.repo << EOF
[mariadb]
name = MariaDB
baseurl = https://mirror.rackspace.com/mariadb/yum/11.2/rhel9-amd64/
gpgkey = https://mirror.rackspace.com/mariadb/yum/RPM-GPG-KEY-MariaDB
gpgcheck = 1
enabled = 1
EOF

# Clean and update DNF cache
sudo dnf clean all
sudo dnf makecache

# Now install MariaDB
sudo dnf install -y MariaDB-server MariaDB-client

# Start MariaDB
sudo systemctl start mariadb
sudo systemctl enable mariadb

while ! mariadb-admin ping -h localhost --silent; do 
  echo "Waiting for MariaDB to be ready..." 
  sleep 2 
done

# Fetch password from AWS Secrets Manager
DB_PASSWORD=$(aws ssm get-parameter \
    --name "/hrm-app/PRIMARY_DATABASE_PASSWORD" \
    --with-decryption \
    --query 'Parameter.Value' \
    --output text)

#login to mariadb default root user
sudo mariadb -u root <<EOF
CREATE DATABASE IF NOT EXISTS myhrm_dev;
EOF

# Install AWS CloudWatch Agent
sudo dnf install -y amazon-cloudwatch-agent

# Create config file directory
mkdir -p /opt/aws/amazon-cloudwatch-agent/etc/

# Cloudwatch agent config for pick Ec2 instance data and application logs
sudo cat > /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json << 'EOF'
{
  "agent": {
    "metrics_collection_interval": 60
  },
  "metrics": {
    "metrics_collected": {
      "cpu": {
        "measurement": ["cpu_usage_idle", "cpu_usage_user", "cpu_usage_system"]
      },
      "disk": {
        "measurement": ["used_percent"],
        "resources": ["/"]
      },
      "mem": {
        "measurement": ["mem_used_percent"]
      }
    }
  },
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/api/logs/*.log",
            "log_group_name": "/ec2/application/api",
            "log_stream_name": "{instance_id}-api",
            "timestamp_format": "%Y-%m-%d %H:%M:%S"
          }
        ]
      }
    }
  }
}
EOF

# Start and enable the agent
systemctl start amazon-cloudwatch-agent
systemctl enable amazon-cloudwatch-agent

echo "EC2 Instance is fully configured for API deployment!"