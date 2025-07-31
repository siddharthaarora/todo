#!/bin/bash

# Database Setup Script
# This script helps set up MongoDB Atlas for the todo application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🗄️  MongoDB Atlas Setup Guide${NC}"
echo -e "\n${YELLOW}This script will help you set up MongoDB Atlas for your todo application.${NC}"

# Check if MongoDB Atlas CLI is installed
if ! command -v mongocli &> /dev/null; then
    echo -e "\n${YELLOW}MongoDB Atlas CLI is not installed. You can set up MongoDB Atlas manually:${NC}"
    echo -e "\n${GREEN}Manual Setup Steps:${NC}"
    echo -e "1. Go to https://cloud.mongodb.com"
    echo -e "2. Create a new account or sign in"
    echo -e "3. Create a new project"
    echo -e "4. Create a new cluster (M0 tier is free)"
    echo -e "5. Create a database user"
    echo -e "6. Get your connection string"
    echo -e "7. Add your IP address to the IP access list"
else
    echo -e "\n${GREEN}MongoDB Atlas CLI is installed. Proceeding with automated setup...${NC}"
    
    # Check if user is logged in
    if ! mongocli auth list &> /dev/null; then
        echo -e "\n${YELLOW}Please log in to MongoDB Atlas:${NC}"
        mongocli auth login
    fi
    
    # Get project ID
    echo -e "\n${YELLOW}Available projects:${NC}"
    mongocli iam projects list
    
    echo -e "\n${YELLOW}Enter your project ID:${NC}"
    read -r PROJECT_ID
    
    # Create cluster
    echo -e "\n${YELLOW}Creating MongoDB cluster...${NC}"
    mongocli atlas cluster create todo-app-cluster \
        --projectId ${PROJECT_ID} \
        --provider AWS \
        --region US_EAST_1 \
        --tier M0 \
        --username admin \
        --password "$(openssl rand -base64 32)"
    
    echo -e "\n${GREEN}✅ MongoDB cluster created successfully!${NC}"
fi

echo -e "\n${YELLOW}Database Setup Instructions:${NC}"
echo -e "\n1. ${GREEN}Get your MongoDB connection string${NC}"
echo -e "   • Go to your MongoDB Atlas dashboard"
echo -e "   • Click 'Connect' on your cluster"
echo -e "   • Choose 'Connect your application'"
echo -e "   • Copy the connection string"

echo -e "\n2. ${GREEN}Set up AWS Secrets Manager${NC}"
echo -e "   • Go to AWS Secrets Manager console"
echo -e "   • Create a new secret for 'production-mongodb-uri'"
echo -e "   • Paste your MongoDB connection string"
echo -e "   • Replace <password> with your actual password"

echo -e "\n3. ${GREEN}Create additional secrets${NC}"
echo -e "   • Create 'production-jwt-secret' with a secure random string"
echo -e "   • Create 'production-google-client-id' with your Google OAuth client ID"
echo -e "   • Create 'production-google-client-secret' with your Google OAuth client secret"

echo -e "\n4. ${GREEN}Update your application configuration${NC}"
echo -e "   • The ECS tasks will automatically read from Secrets Manager"
echo -e "   • No additional configuration needed"

echo -e "\n${YELLOW}Example MongoDB connection string:${NC}"
echo -e "mongodb+srv://admin:<password>@todo-app-cluster.xxxxx.mongodb.net/todo-app?retryWrites=true&w=majority"

echo -e "\n${YELLOW}Example JWT secret:${NC}"
echo -e "$(openssl rand -base64 64)"

echo -e "\n${GREEN}✅ Database setup guide completed!${NC}"
echo -e "\n${YELLOW}Next steps:${NC}"
echo -e "1. Complete the MongoDB Atlas setup"
echo -e "2. Create the required secrets in AWS Secrets Manager"
echo -e "3. Run the application deployment script" 