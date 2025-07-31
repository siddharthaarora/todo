# Complete AWS Deployment Guide for Todo Application

This guide will walk you through deploying your todo application to AWS step by step.

## 🎯 Overview

Your todo application will be deployed with the following architecture:
- **Frontend**: React app hosted on S3 with CloudFront CDN
- **Backend**: Node.js API running on ECS Fargate
- **Database**: MongoDB Atlas (cloud-hosted)
- **Load Balancer**: Application Load Balancer for API traffic
- **Security**: HTTPS, IAM roles, VPC isolation

## 📋 Prerequisites

### 1. AWS Account Setup
- Create an AWS account at https://aws.amazon.com
- Set up billing alerts to avoid unexpected charges
- Create an IAM user with appropriate permissions (or use root for testing)

### 2. Install Required Tools

#### AWS CLI
```bash
# Windows (PowerShell)
winget install -e --id Amazon.AWSCLI

# macOS
brew install awscli

# Linux
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

#### Terraform
```bash
# Windows (PowerShell)
winget install -e --id HashiCorp.Terraform

# macOS
brew install terraform

# Linux
curl -fsSL https://apt.releases.hashicorp.com/gpg | sudo apt-key add -
sudo apt-add-repository "deb [arch=amd64] https://apt.releases.hashicorp.com $(lsb_release -cs) main"
sudo apt-get update && sudo apt-get install terraform
```

#### Docker
```bash
# Windows/macOS
# Download from https://www.docker.com/products/docker-desktop

# Linux
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

### 3. Configure AWS Credentials
```bash
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Enter your default region (e.g., us-east-1)
# Enter your output format (json)
```

## 🚀 Deployment Steps

### Step 1: Database Setup

1. **Create MongoDB Atlas Account**
   - Go to https://cloud.mongodb.com
   - Create a free account
   - Create a new project

2. **Create MongoDB Cluster**
   - Choose "Build a Database"
   - Select "FREE" tier (M0)
   - Choose AWS as provider
   - Select region (us-east-1)
   - Click "Create"

3. **Set Up Database Access**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Username: `admin`
   - Password: Generate a secure password
   - Role: "Atlas admin"
   - Click "Add User"

4. **Set Up Network Access**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password

### Step 2: Google OAuth Setup (Optional)

1. **Create Google Cloud Project**
   - Go to https://console.cloud.google.com
   - Create a new project
   - Enable Google+ API

2. **Create OAuth Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Application type: "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:3000/auth/google/callback` (for development)
     - `https://your-domain.com/auth/google/callback` (for production)
   - Note down Client ID and Client Secret

### Step 3: Deploy Infrastructure

#### Option A: Using PowerShell (Windows)
```powershell
cd aws-deployment
.\deploy-infrastructure.ps1 -Environment production -AwsRegion us-east-1
```

#### Option B: Using Bash (Linux/macOS)
```bash
cd aws-deployment
./deploy-infrastructure.sh production us-east-1
```

#### Option C: Manual Terraform Deployment
```bash
cd aws-deployment/terraform

# Initialize Terraform
terraform init

# Create terraform.tfvars
cat > terraform.tfvars << EOF
aws_region = "us-east-1"
environment = "production"
domain_name = ""
app_image = "todo-app-server:latest"
app_port = 3000
app_count = 2
health_check_path = "/health"
EOF

# Plan and apply
terraform plan -out=tfplan
terraform apply tfplan
```

### Step 4: Set Up Secrets

1. **Go to AWS Secrets Manager Console**
   - Navigate to https://console.aws.amazon.com/secretsmanager
   - Click "Store a new secret"

2. **Create MongoDB URI Secret**
   - Secret type: "Other type of secret"
   - Key/value pairs:
     - Key: `MONGODB_URI`
     - Value: Your MongoDB connection string
   - Secret name: `production-mongodb-uri`
   - Click "Next" and "Store"

3. **Create JWT Secret**
   - Secret type: "Other type of secret"
   - Key/value pairs:
     - Key: `JWT_SECRET`
     - Value: Generate a secure random string (64+ characters)
   - Secret name: `production-jwt-secret`
   - Click "Next" and "Store"

4. **Create Google OAuth Secrets** (if using Google OAuth)
   - Secret name: `production-google-client-id`
   - Value: Your Google Client ID
   
   - Secret name: `production-google-client-secret`
   - Value: Your Google Client Secret

### Step 5: Deploy Applications

#### Option A: Using PowerShell (Windows)
```powershell
.\deploy-applications.ps1 -Environment production -AwsRegion us-east-1
```

#### Option B: Using Bash (Linux/macOS)
```bash
./deploy-applications.sh production us-east-1
```

#### Option C: Manual Deployment

1. **Build and Push Server Image**
```bash
cd ../server
docker build -t todo-app-server:latest .
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
docker tag todo-app-server:latest $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/todo-app-server:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/todo-app-server:latest
```

2. **Build and Deploy Web Application**
```bash
cd ../web
npm ci
npm run build
aws s3 sync dist/ s3://$S3_BUCKET_NAME --delete
aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION_ID --paths "/*"
```

3. **Update ECS Service**
```bash
aws ecs update-service --cluster $ECS_CLUSTER_NAME --service production-app-service --force-new-deployment
```

## 🌐 Access Your Application

After deployment, you can access your application at:

- **Frontend**: `https://your-cloudfront-domain.cloudfront.net`
- **API**: `http://your-alb-dns-name.region.elb.amazonaws.com`

## 🔧 Configuration

### Environment Variables

The application will automatically read these environment variables from AWS Secrets Manager:

- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret for JWT token signing
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret

### Custom Domain Setup

1. **Register a Domain** (if you don't have one)
   - Use Route 53 or any domain registrar

2. **Request SSL Certificate**
   - Go to AWS Certificate Manager
   - Request a certificate for your domain
   - Validate via DNS or email

3. **Update Terraform Configuration**
   - Set `domain_name` in `terraform.tfvars`
   - Re-run infrastructure deployment

4. **Update DNS Records**
   - Point your domain to the CloudFront distribution
   - Point API subdomain to the ALB

## 📊 Monitoring and Logging

### CloudWatch Logs
- Application logs: `/ecs/production-app`
- ALB access logs: Available in S3

### CloudWatch Metrics
- ECS service metrics
- ALB metrics
- CloudFront metrics

### Set Up Alarms
```bash
# Example: CPU utilization alarm
aws cloudwatch put-metric-alarm \
  --alarm-name "ECS-CPU-High" \
  --alarm-description "High CPU utilization" \
  --metric-name "CPUUtilization" \
  --namespace "AWS/ECS" \
  --statistic "Average" \
  --period 300 \
  --threshold 80 \
  --comparison-operator "GreaterThanThreshold" \
  --evaluation-periods 2
```

## 🔄 Updates and Maintenance

### Update Application
```bash
# Build new Docker image
docker build -t todo-app-server:latest .

# Push to ECR
docker push $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/todo-app-server:latest

# Update ECS service
aws ecs update-service --cluster $ECS_CLUSTER_NAME --service production-app-service --force-new-deployment
```

### Update Infrastructure
```bash
cd aws-deployment/terraform
terraform plan
terraform apply
```

## 🧹 Cleanup

To remove all AWS resources:

```bash
# Using cleanup script
./cleanup.sh production us-east-1

# Or manually
cd terraform
terraform destroy -auto-approve
```

**Note**: Remember to manually delete your MongoDB Atlas cluster from the MongoDB console.

## 💰 Cost Optimization

### Estimated Monthly Costs
- **S3**: ~$1-5/month
- **CloudFront**: ~$1-10/month
- **ECS Fargate**: ~$20-50/month
- **ALB**: ~$20/month
- **Route 53**: ~$1/month
- **MongoDB Atlas**: ~$9/month (M0 tier)

**Total**: ~$50-100/month

### Cost Optimization Tips
1. Use Spot instances for non-critical workloads
2. Set up auto-scaling based on demand
3. Use CloudFront caching to reduce origin requests
4. Monitor and optimize database queries
5. Set up billing alerts

## 🛡️ Security Best Practices

1. **Network Security**
   - Use private subnets for ECS tasks
   - Restrict security group rules
   - Use VPC endpoints for AWS services

2. **Application Security**
   - Store secrets in AWS Secrets Manager
   - Use HTTPS everywhere
   - Implement proper authentication
   - Regular security updates

3. **Data Security**
   - Enable encryption at rest
   - Enable encryption in transit
   - Regular backups
   - Access logging

## 🆘 Troubleshooting

### Common Issues

1. **ECS Tasks Not Starting**
   - Check CloudWatch logs
   - Verify secrets are accessible
   - Check security group rules

2. **Application Not Accessible**
   - Verify ALB health checks
   - Check target group configuration
   - Verify security group rules

3. **Database Connection Issues**
   - Verify MongoDB Atlas network access
   - Check connection string format
   - Verify secrets are correctly stored

### Useful Commands

```bash
# Check ECS service status
aws ecs describe-services --cluster $ECS_CLUSTER_NAME --services production-app-service

# View CloudWatch logs
aws logs tail /ecs/production-app --follow

# Check ALB target health
aws elbv2 describe-target-health --target-group-arn $TARGET_GROUP_ARN

# Test application health
curl http://$ALB_DNS_NAME/health
```

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review CloudWatch logs
3. Check AWS Service Health Dashboard
4. Consult AWS documentation
5. Consider AWS Support plans for production workloads

---

**Congratulations!** 🎉 Your todo application is now deployed on AWS with a production-ready architecture. 