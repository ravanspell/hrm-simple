#!/bin/sh

# ANSI escape codes for colors and formatting
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[1;34m'
BOLD='\033[1m'
RESET='\033[0m'


echo -e "${BLUE}---------------------------------------${RESET}"
echo -e "${BOLD}${YELLOW}-----Starting MyHRM API Services-------${RESET}"
echo -e "${BLUE}---------------------------------------${RESET}"
echo -e "${BOLD}${YELLOW}----------- Node version --------------${RESET}"
node --version
echo -e "${BLUE}---------------------------------------${RESET}"

# Installing dependencies
npm install
if [ $? -eq 0 ]; then
  echo -e "${GREEN}${BOLD}Dependencies installed successfully.${RESET}"
else
  echo -e "${RED}${BOLD}Dependencies installation failed.${RESET}" >&2
  exit 1
fi

# fill prisma seed data for dependency tables
echo -e "${BOLD}${YELLOW}apply db migrations...${RESET}"
npx prisma migrate deploy

# fill prisma seed data for dependency tables
echo -e "${BOLD}${YELLOW}Start execute db seeds...${RESET}"
npx prisma db seed

# Start Prisma Studio in the background
echo -e "${BOLD}${YELLOW}Starting Prisma Studio...${RESET}"
npx prisma studio &

# Wait for Prisma Studio to start
sleep 2

echo -e "${BLUE}---------------------------------------${RESET}"
echo -e "${BOLD}${YELLOW}--------------API starting-------------${RESET}"
echo -e "${BLUE}---------------------------------------${RESET}"

# Starting the API
npm run start:dev
