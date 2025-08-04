# Application Deployment Script (PowerShell)
# This script builds and deploys the todo application to AWS

param(
    [string]$Environment = "production",
    [string]$AwsRegion = "us-east-1"
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"

Write-Host "🚀 Starting Application Deployment" -ForegroundColor $Green
Write-Host "Environment: $Environment" -ForegroundColor $Yellow
Write-Host "Region: $AwsRegion" -ForegroundColor $Yellow

# Check prerequisites
Write-Host "`nChecking prerequisites..." -ForegroundColor $Yellow

# Check if AWS CLI is installed
try {
    aws --version | Out-Null
    Write-Host "✅ AWS CLI is installed" -ForegroundColor $Green
} catch {
    Write-Host "❌ AWS CLI is not installed. Please install it first." -ForegroundColor $Red
    exit 1
}

# Check if Docker is installed
try {
    docker --version | Out-Null
    Write-Host "✅ Docker is installed" -ForegroundColor $Green
} catch {
    Write-Host "❌ Docker is not installed. Please install it first." -ForegroundColor $Red
    exit 1
}

# Check if Node.js is installed
try {
    node --version | Out-Null
    Write-Host "✅ Node.js is installed" -ForegroundColor $Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install it first." -ForegroundColor $Red
    exit 1
}

Write-Host "✅ All prerequisites are met" -ForegroundColor $Green

# Check AWS credentials
Write-Host "`nChecking AWS credentials..." -ForegroundColor $Yellow
try {
    aws sts get-caller-identity | Out-Null
    Write-Host "✅ AWS credentials are valid" -ForegroundColor $Green
} catch {
    Write-Host "❌ AWS credentials not configured. Please run 'aws configure' first." -ForegroundColor $Red
    exit 1
}



# Get deployment outputs
Write-Host "`nReading deployment outputs..." -ForegroundColor $Yellow
if (Test-Path "deployment-outputs.txt") {
    $DeploymentOutputs = Get-Content "deployment-outputs.txt" | ForEach-Object {
        if ($_ -match "^(.+)=(.+)$") {
            @{ $matches[1] = $matches[2] }
        }
    }
    
    $S3BucketName = $DeploymentOutputs.S3_BUCKET_NAME
    $EcsClusterName = $DeploymentOutputs.ECS_CLUSTER_NAME
    $AlbDnsName = $DeploymentOutputs.ALB_DNS_NAME
    $CloudfrontDomain = $DeploymentOutputs.CLOUDFRONT_DOMAIN
    
    Write-Host "✅ Deployment outputs loaded" -ForegroundColor $Green
} else {
    Write-Host "❌ Deployment outputs not found. Please run infrastructure deployment first." -ForegroundColor $Red
    exit 1
}

# Create ECR repository for backend
Write-Host "`nSetting up ECR repository..." -ForegroundColor $Yellow
$EcrRepoName = "todo-app-server"
$AccountId = aws sts get-caller-identity --query Account --output text

try {
    aws ecr describe-repositories --repository-names $EcrRepoName --region $AwsRegion | Out-Null
    Write-Host "✅ ECR repository already exists: $EcrRepoName" -ForegroundColor $Green
} catch {
    Write-Host "Creating ECR repository..." -ForegroundColor $Yellow
    aws ecr create-repository --repository-name $EcrRepoName --region $AwsRegion
    Write-Host "✅ ECR repository created: $EcrRepoName" -ForegroundColor $Green
}

$EcrRepoUri = "$AccountId.dkr.ecr.$AwsRegion.amazonaws.com/$EcrRepoName"

# Login to ECR
Write-Host "`nLogging into ECR..." -ForegroundColor $Yellow
$password = aws ecr get-login-password --region $AwsRegion
docker login --username AWS --password $password $EcrRepoUri
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ECR login failed!" -ForegroundColor $Red
    exit 1
}
Write-Host "✅ Logged into ECR" -ForegroundColor $Green

# Build and push backend Docker image
Write-Host "`nBuilding backend Docker image..." -ForegroundColor $Yellow
Set-Location "../server"

# Install dependencies
Write-Host "Installing backend dependencies..." -ForegroundColor $Yellow
npm install

# Build Docker image
Write-Host "Building Docker image..." -ForegroundColor $Yellow
docker build -t $EcrRepoName .
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker build failed!" -ForegroundColor $Red
    exit 1
}

docker tag $EcrRepoName`:latest $EcrRepoUri`:latest
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker tag failed!" -ForegroundColor $Red
    exit 1
}

# Push to ECR
Write-Host "Pushing Docker image to ECR..." -ForegroundColor $Yellow
docker push $EcrRepoUri`:latest
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker push failed!" -ForegroundColor $Red
    exit 1
}
Write-Host "✅ Backend Docker image pushed to ECR" -ForegroundColor $Green

Set-Location "../aws-deployment"

# Build frontend
Write-Host "`nBuilding frontend..." -ForegroundColor $Yellow
Set-Location "../web"

# Install dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor $Yellow
npm install

# Build for production
Write-Host "Building frontend for production..." -ForegroundColor $Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend build failed!" -ForegroundColor $Red
    exit 1
}

# Upload frontend to S3
Write-Host "`nUploading frontend to S3..." -ForegroundColor $Yellow
aws s3 sync dist/ s3://$S3BucketName --delete --region $AwsRegion
Write-Host "✅ Frontend uploaded to S3" -ForegroundColor $Green

Set-Location "../aws-deployment"

# Update ECS service with new image
Write-Host "`nUpdating ECS service..." -ForegroundColor $Yellow
aws ecs update-service --cluster $EcsClusterName --service production-app-service --force-new-deployment --region $AwsRegion
Write-Host "✅ ECS service updated" -ForegroundColor $Green

# Wait for ECS service to be stable
Write-Host "`nWaiting for ECS service to be stable..." -ForegroundColor $Yellow
aws ecs wait services-stable --cluster $EcsClusterName --services production-app-service --region $AwsRegion
Write-Host "✅ ECS service is stable" -ForegroundColor $Green

# Invalidate CloudFront cache
Write-Host "`nInvalidating CloudFront cache..." -ForegroundColor $Yellow
$DistributionId = aws cloudfront list-distributions --query "DistributionList.Items[?Aliases.Items[?contains(@, '$CloudfrontDomain')]].Id" --output text --region $AwsRegion
aws cloudfront create-invalidation --distribution-id $DistributionId --paths "/*" --region $AwsRegion
Write-Host "✅ CloudFront cache invalidated" -ForegroundColor $Green

Write-Host "`n🎉 Application deployment completed successfully!" -ForegroundColor $Green
Write-Host "`nDeployment Summary:" -ForegroundColor $Yellow
Write-Host "  • Frontend URL: https://$CloudfrontDomain" -ForegroundColor $Yellow
Write-Host "  • Backend API: http://$AlbDnsName" -ForegroundColor $Yellow
Write-Host "  • ECS Cluster: $EcsClusterName" -ForegroundColor $Yellow
Write-Host "  • S3 Bucket: $S3BucketName" -ForegroundColor $Yellow

Write-Host "`nNext steps:" -ForegroundColor $Yellow
Write-Host "  1. Test your application at: https://$CloudfrontDomain" -ForegroundColor $Yellow
Write-Host "  2. Configure Google OAuth in Google Cloud Console" -ForegroundColor $Yellow
Write-Host "  3. Configure your domain (if using custom domain)" -ForegroundColor $Yellow 