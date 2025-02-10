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

# Update package repository and upgrade system packages
sudo dnf update -y

# Install necessary utilities
sudo dnf install -y unzip git

# Install AWS CloudWatch Agent
sudo dnf install -y amazon-cloudwatch-agent

# Create config file directory
mkdir -p /opt/aws/amazon-cloudwatch-agent/etc/

# Cloudwatch agent config for pick Ec2 instance data and application logs
cat > /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json << 'EOF'
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
            "file_path": "/backend/logs/*.log",
            "log_group_name": "/ec2/application/backend",
            "log_stream_name": "{instance_id}-backend",
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
    --region us-east-1 \
    --name "/myhrm/prod/db/root" \
    --with-decryption \
    --query 'Parameter.Value' \
    --output text)

#login to mariadb default root user
sudo mariadb -u root <<EOF

# Set root password
ALTER USER 'root'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';

# Create application database
CREATE DATABASE IF NOT EXISTS myhrm_dev;

# Create application database
CREATE DATABASE IF NOT EXISTS myhrm_dev;

# Create application user with limited privileges
CREATE USER 'myhrm_user'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';
GRANT ALL PRIVILEGES ON myhrm_dev.* TO 'myhrm_user'@'localhost';

# Apply changes
FLUSH PRIVILEGES;
EOF

# install NVM - node version manager
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

#Load nvm
source ~/.bashrc

# install node.js version 20.17.0 as default with NVM
nvm install default 20.17.0

#select installed node.js version
nvm use 20.17.0

# Install PM2 globally
sudo npm install -g pm2

# Ensure PM2 starts on boot for ec2-user
pm2 startup systemd -u ec2-user --hp /home/ec2-user
sudo env PATH=$PATH:/home/ec2-user/.nvm/versions/node/v22.13.1/bin pm2 startup systemd -u ec2-user --hp /home/ec2-user

# Create a dedicated directory for the backend
mkdir -p backend
cd backend

# Change ownership to ec2-user
sudo chown -R ec2-user:ec2-user backend

# Initialize Git repo (if not already initialized)
if [ ! -d ".git" ]; then
  echo "Initializing Git repository..."
  git init
  git remote add origin https://github.com/ravanspell/hrm-simple.git
fi

echo "EC2 Instance is fully configured for API deployment!"