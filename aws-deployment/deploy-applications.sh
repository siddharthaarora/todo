#!/bin/bash

# Application Deployment Script
# This script builds and deploys the todo applications

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-production}
AWS_REGION=${2:-us-east-1}
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REPOSITORY_PREFIX="todo-app"

echo -e "${GREEN}🚀 Starting Application Deployment${NC}"
echo -e "${YELLOW}Environment: ${ENVIRONMENT}${NC}"
echo -e "${YELLOW}Region: ${AWS_REGION}${NC}"
echo -e "${YELLOW}AWS Account: ${AWS_ACCOUNT_ID}${NC}"

# Load deployment outputs if available
if [ -f "deployment-outputs.txt" ]; then
    echo -e "\n${YELLOW}Loading deployment outputs...${NC}"
    source deployment-outputs.txt
else
    echo -e "${RED}❌ deployment-outputs.txt not found. Please run deploy-infrastructure.sh first.${NC}"
    exit 1
fi

# Create ECR repositories
echo -e "\n${YELLOW}Setting up ECR repositories...${NC}"

# Server repository
SERVER_REPO_NAME="${ECR_REPOSITORY_PREFIX}-server"
if ! aws ecr describe-repositories --repository-names ${SERVER_REPO_NAME} --region ${AWS_REGION} &> /dev/null; then
    echo -e "${YELLOW}Creating ECR repository for server...${NC}"
    aws ecr create-repository --repository-name ${SERVER_REPO_NAME} --region ${AWS_REGION}
fi

# Get ECR login token
echo -e "\n${YELLOW}Logging into ECR...${NC}"
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

# Build and push server image
echo -e "\n${YELLOW}Building and pushing server image...${NC}"
cd ../server

# Build Docker image
docker build -t ${SERVER_REPO_NAME}:latest .

# Tag for ECR
docker tag ${SERVER_REPO_NAME}:latest ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${SERVER_REPO_NAME}:latest

# Push to ECR
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${SERVER_REPO_NAME}:latest

echo -e "${GREEN}✅ Server image pushed to ECR${NC}"

# Build and deploy web application
echo -e "\n${YELLOW}Building and deploying web application...${NC}"
cd ../web

# Install dependencies
npm ci

# Build the application
npm run build

# Deploy to S3
echo -e "\n${YELLOW}Deploying web application to S3...${NC}"
aws s3 sync dist/ s3://${S3_BUCKET_NAME} --delete --region ${AWS_REGION}

# Invalidate CloudFront cache
echo -e "\n${YELLOW}Invalidating CloudFront cache...${NC}"
CLOUDFRONT_DISTRIBUTION_ID=$(aws cloudfront list-distributions --query "DistributionList.Items[?Aliases.Items[?contains(@, '${CLOUDFRONT_DOMAIN}')]].Id" --output text --region ${AWS_REGION})
aws cloudfront create-invalidation --distribution-id ${CLOUDFRONT_DISTRIBUTION_ID} --paths "/*" --region ${AWS_REGION}

echo -e "${GREEN}✅ Web application deployed to S3 and CloudFront cache invalidated${NC}"

# Update ECS service with new image
echo -e "\n${YELLOW}Updating ECS service...${NC}"
aws ecs update-service --cluster ${ECS_CLUSTER_NAME} --service ${ENVIRONMENT}-app-service --force-new-deployment --region ${AWS_REGION}

echo -e "\n${GREEN}🎉 Application deployment completed successfully!${NC}"
echo -e "\n${YELLOW}Deployment Summary:${NC}"
echo -e "  • Server Image: ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${SERVER_REPO_NAME}:latest"
echo -e "  • Web Application: https://${CLOUDFRONT_DOMAIN}"
echo -e "  • API Endpoint: http://${ALB_DNS_NAME}"
echo -e "  • ECS Service: ${ECS_CLUSTER_NAME}/${ENVIRONMENT}-app-service"

echo -e "\n${YELLOW}Next steps:${NC}"
echo -e "  1. Wait for ECS service to stabilize (check AWS Console)"
echo -e "  2. Test your application endpoints"
echo -e "  3. Set up monitoring and alerts"
echo -e "  4. Configure your domain (if using custom domain)"

cd ../aws-deployment 