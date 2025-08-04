# AWS Secrets Manager Setup Script (PowerShell)
# This script sets up the required secrets for the todo application

param(
    [string]$Environment = "production",
    [string]$AwsRegion = "us-east-1"
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"

Write-Host "Setting up AWS Secrets Manager" -ForegroundColor $Green
Write-Host "Environment: $Environment" -ForegroundColor $Yellow
Write-Host "Region: $AwsRegion" -ForegroundColor $Yellow

# Check AWS credentials
Write-Host "`nChecking AWS credentials..." -ForegroundColor $Yellow
try {
    aws sts get-caller-identity | Out-Null
    Write-Host "AWS credentials are valid" -ForegroundColor $Green
} catch {
    Write-Host "AWS credentials not configured. Please run 'aws configure' first." -ForegroundColor $Red
    exit 1
}

# Secret names
$SecretNames = @(
    "production-mongodb-uri",
    "production-jwt-secret", 
    "production-google-client-id",
    "production-google-client-secret"
)

Write-Host "`nRequired secrets:" -ForegroundColor $Yellow
$SecretNames | ForEach-Object { Write-Host "  $_" -ForegroundColor $Yellow }

Write-Host "`nYou need to provide values for these secrets:" -ForegroundColor $Yellow
Write-Host "1. MongoDB URI (e.g., mongodb://localhost:27017/todo or MongoDB Atlas connection string)" -ForegroundColor $Yellow
Write-Host "2. JWT Secret (a secure random string for signing JWTs)" -ForegroundColor $Yellow
Write-Host "3. Google Client ID (from Google Cloud Console)" -ForegroundColor $Yellow
Write-Host "4. Google Client Secret (from Google Cloud Console)" -ForegroundColor $Yellow

Write-Host "`nDo you want to:" -ForegroundColor $Yellow
Write-Host "1. Enter secrets manually" -ForegroundColor $Yellow
Write-Host "2. Use placeholder values for testing" -ForegroundColor $Yellow
Write-Host "3. Skip and set up later" -ForegroundColor $Yellow

$choice = Read-Host "Enter your choice (1-3)"

if ($choice -eq "1") {
    # Manual entry
    $MongoDbUri = Read-Host "Enter MongoDB URI" -AsSecureString
    $JwtSecret = Read-Host "Enter JWT Secret" -AsSecureString
    $GoogleClientId = Read-Host "Enter Google Client ID" -AsSecureString
    $GoogleClientSecret = Read-Host "Enter Google Client Secret" -AsSecureString
    
    # Convert to plain text
    $MongoDbUriText = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($MongoDbUri))
    $JwtSecretText = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($JwtSecret))
    $GoogleClientIdText = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($GoogleClientId))
    $GoogleClientSecretText = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($GoogleClientSecret))
    
} elseif ($choice -eq "2") {
    # Placeholder values for testing
    $MongoDbUriText = "mongodb://localhost:27017/todo"
    $JwtSecretText = "your-super-secret-jwt-key-change-this-in-production"
    $GoogleClientIdText = "your-google-client-id"
    $GoogleClientSecretText = "your-google-client-secret"
    
    Write-Host "`nUsing placeholder values for testing!" -ForegroundColor $Yellow
    Write-Host "Remember to update these with real values before production use." -ForegroundColor $Yellow
    
} else {
    Write-Host "`nSkipping secrets setup. You can set them up later manually." -ForegroundColor $Yellow
    Write-Host "`nTo set up secrets manually:" -ForegroundColor $Yellow
    Write-Host "1. Go to AWS Secrets Manager console" -ForegroundColor $Yellow
    Write-Host "2. Create secrets with these names:" -ForegroundColor $Yellow
    $SecretNames | ForEach-Object { Write-Host "   $_" -ForegroundColor $Yellow }
    Write-Host "3. Update the ECS task definition to use the real secret ARNs" -ForegroundColor $Yellow
    exit 0
}

# Create secrets
Write-Host "`nCreating secrets in AWS Secrets Manager..." -ForegroundColor $Yellow

$secrets = @{
    "production-mongodb-uri" = $MongoDbUriText
    "production-jwt-secret" = $JwtSecretText
    "production-google-client-id" = $GoogleClientIdText
    "production-google-client-secret" = $GoogleClientSecretText
}

foreach ($secretName in $secrets.Keys) {
    $secretValue = $secrets[$secretName]
    
    try {
        # Check if secret already exists
        aws secretsmanager describe-secret --secret-id $secretName --region $AwsRegion | Out-Null
        Write-Host "Secret already exists: $secretName" -ForegroundColor $Yellow
        
        # Update the secret
        $secretJson = "{`"secret`":`"$secretValue`"}"
        aws secretsmanager update-secret --secret-id $secretName --secret-string $secretJson --region $AwsRegion | Out-Null
        Write-Host "Updated secret: $secretName" -ForegroundColor $Green
        
    } catch {
        # Create new secret
        $secretJson = "{`"secret`":`"$secretValue`"}"
        aws secretsmanager create-secret --name $secretName --secret-string $secretJson --region $AwsRegion | Out-Null
        Write-Host "Created secret: $secretName" -ForegroundColor $Green
    }
}

Write-Host "`nSecrets setup completed!" -ForegroundColor $Green
Write-Host "`nNext steps:" -ForegroundColor $Yellow
Write-Host "1. Run the application deployment: .\deploy-application.ps1" -ForegroundColor $Yellow
Write-Host "2. Test your application" -ForegroundColor $Yellow

if ($choice -eq "2") {
    Write-Host "`nRemember to update secrets with real values before production!" -ForegroundColor $Red
} 