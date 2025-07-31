#!/bin/bash

# AWS Infrastructure Deployment Script
# This script deploys the todo application infrastructure to AWS

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-production}
AWS_REGION=${2:-us-east-1}
DOMAIN_NAME=${3:-""}

echo -e "${GREEN}🚀 Starting AWS Infrastructure Deployment${NC}"
echo -e "${YELLOW}Environment: ${ENVIRONMENT}${NC}"
echo -e "${YELLOW}Region: ${AWS_REGION}${NC}"
echo -e "${YELLOW}Domain: ${DOMAIN_NAME:-'None (using default domains)'}${NC}"

# Check prerequisites
echo -e "\n${YELLOW}Checking prerequisites...${NC}"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if Terraform is installed
if ! command -v terraform &> /dev/null; then
    echo -e "${RED}❌ Terraform is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install it first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All prerequisites are met${NC}"

# Check AWS credentials
echo -e "\n${YELLOW}Checking AWS credentials...${NC}"
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured. Please run 'aws configure' first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ AWS credentials are valid${NC}"

# Create S3 bucket for Terraform state (if it doesn't exist)
echo -e "\n${YELLOW}Setting up Terraform state storage...${NC}"
BUCKET_NAME="todo-app-terraform-state-$(aws sts get-caller-identity --query Account --output text)"

if ! aws s3 ls "s3://${BUCKET_NAME}" &> /dev/null; then
    echo -e "${YELLOW}Creating S3 bucket for Terraform state...${NC}"
    aws s3 mb "s3://${BUCKET_NAME}" --region ${AWS_REGION}
    aws s3api put-bucket-versioning --bucket "${BUCKET_NAME}" --versioning-configuration Status=Enabled
    aws s3api put-bucket-encryption --bucket "${BUCKET_NAME}" --server-side-encryption-configuration '{
        "Rules": [
            {
                "ApplyServerSideEncryptionByDefault": {
                    "SSEAlgorithm": "AES256"
                }
            }
        ]
    }'
    echo -e "${GREEN}✅ S3 bucket created: ${BUCKET_NAME}${NC}"
else
    echo -e "${GREEN}✅ S3 bucket already exists: ${BUCKET_NAME}${NC}"
fi

# Navigate to Terraform directory
cd terraform

# Initialize Terraform
echo -e "\n${YELLOW}Initializing Terraform...${NC}"
terraform init

# Create terraform.tfvars file
echo -e "\n${YELLOW}Creating Terraform variables file...${NC}"
cat > terraform.tfvars << EOF
aws_region = "${AWS_REGION}"
environment = "${ENVIRONMENT}"
domain_name = "${DOMAIN_NAME}"
app_image = "todo-app-server:latest"
app_port = 3000
app_count = 2
health_check_path = "/health"
EOF

# Plan Terraform deployment
echo -e "\n${YELLOW}Planning Terraform deployment...${NC}"
terraform plan -out=tfplan

# Ask for confirmation
echo -e "\n${YELLOW}Do you want to proceed with the deployment? (y/N)${NC}"
read -r response
if [[ ! "$response" =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Deployment cancelled.${NC}"
    exit 0
fi

# Apply Terraform deployment
echo -e "\n${YELLOW}Applying Terraform deployment...${NC}"
terraform apply tfplan

# Get outputs
echo -e "\n${YELLOW}Getting deployment outputs...${NC}"
ALB_DNS_NAME=$(terraform output -raw alb_dns_name)
CLOUDFRONT_DOMAIN=$(terraform output -raw cloudfront_domain)
S3_BUCKET_NAME=$(terraform output -raw s3_bucket_name)
ECS_CLUSTER_NAME=$(terraform output -raw ecs_cluster_name)

echo -e "\n${GREEN}🎉 Infrastructure deployment completed successfully!${NC}"
echo -e "\n${YELLOW}Deployment Summary:${NC}"
echo -e "  • Application Load Balancer: ${ALB_DNS_NAME}"
echo -e "  • CloudFront Distribution: ${CLOUDFRONT_DOMAIN}"
echo -e "  • S3 Bucket: ${S3_BUCKET_NAME}"
echo -e "  • ECS Cluster: ${ECS_CLUSTER_NAME}"

# Save outputs to file for later use
cat > ../deployment-outputs.txt << EOF
ALB_DNS_NAME=${ALB_DNS_NAME}
CLOUDFRONT_DOMAIN=${CLOUDFRONT_DOMAIN}
S3_BUCKET_NAME=${S3_BUCKET_NAME}
ECS_CLUSTER_NAME=${ECS_CLUSTER_NAME}
EOF

echo -e "\n${GREEN}✅ Deployment outputs saved to deployment-outputs.txt${NC}"
echo -e "\n${YELLOW}Next steps:${NC}"
echo -e "  1. Set up your secrets in AWS Secrets Manager"
echo -e "  2. Build and push your Docker images"
echo -e "  3. Deploy your applications"
echo -e "  4. Configure your domain (if using custom domain)"

cd .. 