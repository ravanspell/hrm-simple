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

# Install Node.js (LTS) and npm using NodeSource for RPM-based systems
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

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

# Create a database if it does not exist
echo "CREATE DATABASE IF NOT EXISTS myhrm-db-v1;" | sudo mysql

# Install AWS CloudWatch Agent
sudo dnf install -y amazon-cloudwatch-agent

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