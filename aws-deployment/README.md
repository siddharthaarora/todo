# AWS Deployment Guide for Todo Application

This guide will help you deploy your todo application to AWS using modern cloud infrastructure.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CloudFront    │    │   Application   │    │   MongoDB       │
│   (CDN)         │    │   Load Balancer │    │   Atlas         │
│                 │    │                 │    │                 │
│   - Static      │───▶│   - Web Server  │───▶│   - Database    │
│   - Caching     │    │   - API Server  │    │   - Collections │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│   S3 Bucket     │    │   ECS Fargate   │
│   (Static Files)│    │   (Containers)  │
│                 │    │                 │
│   - React App   │    │   - Node.js API │
│   - Assets      │    │   - Auto Scaling│
└─────────────────┘    └─────────────────┘
```

## Prerequisites

1. **AWS Account** with appropriate permissions
2. **AWS CLI** installed and configured
3. **Docker** installed locally
4. **MongoDB Atlas** account (or AWS DocumentDB)
5. **Domain name** (optional, for custom domain)

## Deployment Steps

### 1. Environment Setup

```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure AWS CLI
aws configure
```

### 2. Infrastructure Deployment

```bash
# Deploy infrastructure
cd aws-deployment
./deploy-infrastructure.sh
```

### 3. Application Deployment

```bash
# Build and deploy applications
./deploy-applications.sh
```

### 4. Database Setup

```bash
# Set up MongoDB Atlas (or DocumentDB)
./setup-database.sh
```

## Services Used

- **S3**: Static file hosting for React app
- **CloudFront**: CDN for global content delivery
- **ECS Fargate**: Containerized API server
- **Application Load Balancer**: Traffic distribution
- **Route 53**: DNS management
- **MongoDB Atlas**: Database (or AWS DocumentDB)
- **IAM**: Security and permissions
- **VPC**: Network isolation
- **Security Groups**: Firewall rules

## Cost Estimation

Estimated monthly costs (US East region):
- S3: ~$1-5/month
- CloudFront: ~$1-10/month
- ECS Fargate: ~$20-50/month
- ALB: ~$20/month
- Route 53: ~$1/month
- MongoDB Atlas: ~$9/month (M0 tier)

**Total: ~$50-100/month** for a small to medium application.

## Security Considerations

- All traffic uses HTTPS
- API keys and secrets stored in AWS Secrets Manager
- VPC with private subnets for containers
- Security groups with minimal required access
- IAM roles with least privilege principle

## Monitoring and Logging

- CloudWatch for metrics and logs
- Application Load Balancer access logs
- ECS service logs
- Custom application metrics

## Scaling

- Auto-scaling based on CPU/memory usage
- CloudFront for global content delivery
- MongoDB Atlas auto-scaling (if using Atlas)

## Backup and Recovery

- S3 versioning for static files
- MongoDB Atlas automated backups
- ECS task definition versioning
- Infrastructure as Code for easy recreation 