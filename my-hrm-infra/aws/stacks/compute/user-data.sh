#!/bin/bash

# Update package repository and upgrade system packages
sudo apt update && sudo apt upgrade -y

# Install necessary utilities
sudo apt install -y curl unzip git awscli

# Install Node.js (LTS) and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install MySQL Server
sudo apt install -y mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql

# Secure MySQL installation
echo "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_strong_password';" | sudo mysql

# Install AWS CloudWatch Agent
sudo apt install -y amazon-cloudwatch-agent

# Ensure PM2 starts on boot
pm2 startup systemd -u ubuntu --hp /home/ubuntu
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu

# Create a dedicated directory for the backend
mkdir -p /home/ubuntu/backend/logs
cd /home/ubuntu/backend

# Change ownership to ubuntu user
sudo chown -R ubuntu:ubuntu /home/ubuntu/backend

# Initialize Git repo (if not already initialized)
if [ ! -d ".git" ]; then
  echo "Initializing Git repository..."
  git init
  git remote add origin https://github.com/ravanspell/hrm-simple.git
  git pull origin master
fi

# Install dependencies if package.json exists
if [ -f "package.json" ]; then
  npm install
fi

# Start NestJS app with PM2
pm2 start "npm run start" --name "nestjs-app" --log "/home/ubuntu/backend/logs/app.log"
pm2 save

echo "EC2 Instance is fully configured for NestJS deployment!"