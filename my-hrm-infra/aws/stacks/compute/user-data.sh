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
sudo yum update -y

# Install necessary utilities
sudo yum install -y curl unzip git awscli

# Install Node.js (LTS) and npm using NodeSource for RPM-based systems
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install MariaDB Server (as a replacement for MySQL)
sudo yum install -y mariadb-server
sudo systemctl start mariadb
sudo systemctl enable mariadb

# (Optional) Secure MariaDB installation: set the root password to empty.
# Note: Adjust this step if you require a more secure configuration.
echo "ALTER USER 'root'@'localhost' IDENTIFIED BY '';" | sudo mysql

# Create a database if it does not exist
echo "CREATE DATABASE IF NOT EXISTS myhrm-db-v1;" | sudo mysql

# Install AWS CloudWatch Agent
sudo yum install -y amazon-cloudwatch-agent

# Ensure PM2 starts on boot for ec2-user
pm2 startup systemd -u ec2-user --hp /home/ec2-user
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ec2-user --hp /home/ec2-user

# Create a dedicated directory for the backend
mkdir -p /home/ec2-user/backend/logs
cd /home/ec2-user/backend

# Change ownership to ec2-user
sudo chown -R ec2-user:ec2-user /home/ec2-user/backend

# Initialize Git repo (if not already initialized)
if [ ! -d ".git" ]; then
  echo "Initializing Git repository..."
  git init
  git remote add origin https://github.com/ravanspell/hrm-simple.git
fi

echo "EC2 Instance is fully configured for API deployment!"