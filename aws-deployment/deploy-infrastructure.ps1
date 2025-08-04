# AWS Infrastructure Deployment Script (PowerShell)
# This script deploys the todo application infrastructure to AWS

param(
    [string]$Environment = "production",
    [string]$AwsRegion = "us-east-1",
    [string]$DomainName = ""
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"

Write-Host "🚀 Starting AWS Infrastructure Deployment" -ForegroundColor $Green
Write-Host "Environment: $Environment" -ForegroundColor $Yellow
Write-Host "Region: $AwsRegion" -ForegroundColor $Yellow
Write-Host "Domain: $(if ($DomainName) { $DomainName } else { 'None (using default domains)' })" -ForegroundColor $Yellow

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

# Check if Terraform is installed
try {
    terraform --version | Out-Null
    Write-Host "✅ Terraform is installed" -ForegroundColor $Green
} catch {
    Write-Host "❌ Terraform is not installed. Please install it first." -ForegroundColor $Red
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

# Create S3 bucket for Terraform state (if it doesn't exist)
Write-Host "`nSetting up Terraform state storage..." -ForegroundColor $Yellow
$AccountId = aws sts get-caller-identity --query Account --output text
$BucketName = "todo-app-terraform-state-$AccountId"

try {
    aws s3 ls "s3://$BucketName" --region $AwsRegion 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ S3 bucket already exists: $BucketName" -ForegroundColor $Green
    } else {
        throw "Bucket not found"
    }
} catch {
    Write-Host "Creating S3 bucket for Terraform state..." -ForegroundColor $Yellow
    aws s3 mb "s3://$BucketName" --region $AwsRegion
    aws s3api put-bucket-versioning --bucket $BucketName --versioning-configuration Status=Enabled
    aws s3api put-bucket-encryption --bucket $BucketName --server-side-encryption-configuration '{\"Rules\":[{\"ApplyServerSideEncryptionByDefault\":{\"SSEAlgorithm\":\"AES256\"}}]}'
    Write-Host "✅ S3 bucket created: $BucketName" -ForegroundColor $Green
}

# Navigate to Terraform directory
Set-Location terraform

# Update Terraform backend configuration with actual bucket name
Write-Host "`nUpdating Terraform backend configuration..." -ForegroundColor $Yellow
$BackendConfig = Get-Content "main.tf" -Raw
$BackendConfig = $BackendConfig -replace "ACCOUNT_ID_PLACEHOLDER", $AccountId
$BackendConfig | Set-Content "main.tf" -Encoding UTF8

# Initialize Terraform
Write-Host "`nInitializing Terraform..." -ForegroundColor $Yellow
terraform init

# Create terraform.tfvars file
Write-Host "`nCreating Terraform variables file..." -ForegroundColor $Yellow
@"
aws_region = "$AwsRegion"
environment = "$Environment"
domain_name = "$DomainName"
app_image = "todo-app-server:latest"
app_port = 3000
app_count = 2
health_check_path = "/health"
mongodb_uri = "placeholder"
jwt_secret = "placeholder"
google_client_id = "placeholder"
google_client_secret = "placeholder"
"@ | Out-File -FilePath "terraform.tfvars" -Encoding UTF8

# Plan Terraform deployment
Write-Host "`nPlanning Terraform deployment..." -ForegroundColor $Yellow
terraform plan -out=tfplan

# Ask for confirmation
Write-Host "`nDo you want to proceed with the deployment? (y/N)" -ForegroundColor $Yellow
$response = Read-Host
if ($response -notmatch "^[Yy]$") {
    Write-Host "Deployment cancelled." -ForegroundColor $Yellow
    exit 0
}

# Apply Terraform deployment
Write-Host "`nApplying Terraform deployment..." -ForegroundColor $Yellow
terraform apply tfplan

# Get outputs
Write-Host "`nGetting deployment outputs..." -ForegroundColor $Yellow
$AlbDnsName = terraform output -raw alb_dns_name
$CloudfrontDomain = terraform output -raw cloudfront_domain
$S3BucketName = terraform output -raw s3_bucket_name
$EcsClusterName = terraform output -raw ecs_cluster_name

Write-Host "`n🎉 Infrastructure deployment completed successfully!" -ForegroundColor $Green
Write-Host "`nDeployment Summary:" -ForegroundColor $Yellow
Write-Host "  • Application Load Balancer: $AlbDnsName" -ForegroundColor $Yellow
Write-Host "  • CloudFront Distribution: $CloudfrontDomain" -ForegroundColor $Yellow
Write-Host "  • S3 Bucket: $S3BucketName" -ForegroundColor $Yellow
Write-Host "  • ECS Cluster: $EcsClusterName" -ForegroundColor $Yellow

# Save outputs to file for later use
@"
ALB_DNS_NAME=$AlbDnsName
CLOUDFRONT_DOMAIN=$CloudfrontDomain
S3_BUCKET_NAME=$S3BucketName
ECS_CLUSTER_NAME=$EcsClusterName
"@ | Out-File -FilePath "../deployment-outputs.txt" -Encoding UTF8

Write-Host "`n✅ Deployment outputs saved to deployment-outputs.txt" -ForegroundColor $Green
Write-Host "`nNext steps:" -ForegroundColor $Yellow
Write-Host "  1. Set up your secrets in AWS Secrets Manager" -ForegroundColor $Yellow
Write-Host "  2. Build and push your Docker images" -ForegroundColor $Yellow
Write-Host "  3. Deploy your applications" -ForegroundColor $Yellow
Write-Host "  4. Configure your domain (if using custom domain)" -ForegroundColor $Yellow

Set-Location .. 