#!/bin/bash

# AWS Cleanup Script
# This script removes all AWS resources created for the todo application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-production}
AWS_REGION=${2:-us-east-1}

echo -e "${RED}⚠️  AWS Resource Cleanup${NC}"
echo -e "\n${YELLOW}This script will remove ALL AWS resources created for the todo application.${NC}"
echo -e "${YELLOW}Environment: ${ENVIRONMENT}${NC}"
echo -e "${YELLOW}Region: ${AWS_REGION}${NC}"

# Ask for confirmation
echo -e "\n${RED}Are you sure you want to proceed? This action cannot be undone! (yes/NO)${NC}"
read -r response
if [[ ! "$response" =~ ^[Yy][Ee][Ss]$ ]]; then
    echo -e "${YELLOW}Cleanup cancelled.${NC}"
    exit 0
fi

# Navigate to Terraform directory
cd terraform

# Destroy Terraform resources
echo -e "\n${YELLOW}Destroying Terraform resources...${NC}"
terraform destroy -auto-approve

# Remove ECR repositories
echo -e "\n${YELLOW}Removing ECR repositories...${NC}"
aws ecr delete-repository --repository-name todo-app-server --force --region ${AWS_REGION} 2>/dev/null || true

# Remove S3 bucket for Terraform state
echo -e "\n${YELLOW}Removing Terraform state bucket...${NC}"
BUCKET_NAME="todo-app-terraform-state-$(aws sts get-caller-identity --query Account --output text)"
aws s3 rb s3://${BUCKET_NAME} --force --region ${AWS_REGION} 2>/dev/null || true

# Remove secrets from Secrets Manager
echo -e "\n${YELLOW}Removing secrets from Secrets Manager...${NC}"
aws secretsmanager delete-secret --secret-id ${ENVIRONMENT}-mongodb-uri --force-delete-without-recovery --region ${AWS_REGION} 2>/dev/null || true
aws secretsmanager delete-secret --secret-id ${ENVIRONMENT}-jwt-secret --force-delete-without-recovery --region ${AWS_REGION} 2>/dev/null || true
aws secretsmanager delete-secret --secret-id ${ENVIRONMENT}-google-client-id --force-delete-without-recovery --region ${AWS_REGION} 2>/dev/null || true
aws secretsmanager delete-secret --secret-id ${ENVIRONMENT}-google-client-secret --force-delete-without-recovery --region ${AWS_REGION} 2>/dev/null || true

# Remove deployment outputs file
cd ..
rm -f deployment-outputs.txt

echo -e "\n${GREEN}✅ Cleanup completed successfully!${NC}"
echo -e "\n${YELLOW}Note:${NC}"
echo -e "  • MongoDB Atlas cluster must be deleted manually from the MongoDB Atlas console"
echo -e "  • Any custom domain configurations must be removed manually"
echo -e "  • CloudWatch logs may take up to 24 hours to be automatically deleted" 