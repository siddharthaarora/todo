# MongoDB Connection Test Script (PowerShell)
# This script tests the MongoDB connection using the secret stored in AWS Secrets Manager

param(
    [string]$AwsRegion = "us-east-1"
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"

Write-Host "🔍 Testing MongoDB Connection" -ForegroundColor $Green
Write-Host "Region: $AwsRegion" -ForegroundColor $Yellow

# Check AWS credentials
Write-Host "`nChecking AWS credentials..." -ForegroundColor $Yellow
try {
    aws sts get-caller-identity | Out-Null
    Write-Host "✅ AWS credentials are valid" -ForegroundColor $Green
} catch {
    Write-Host "❌ AWS credentials not configured. Please run 'aws configure' first." -ForegroundColor $Red
    exit 1
}

# Check if MongoDB URI secret exists
Write-Host "`nRetrieving MongoDB URI from AWS Secrets Manager..." -ForegroundColor $Yellow
try {
    $MongoDbSecret = aws secretsmanager get-secret-value --secret-id "production-mongodb-uri" --region $AwsRegion --query SecretString --output text 2>$null
    if ($LASTEXITCODE -eq 0 -and $MongoDbSecret -and $MongoDbSecret -ne "null") {
        Write-Host "✅ MongoDB URI secret found" -ForegroundColor $Green
        Write-Host "URI format: $($MongoDbSecret.Substring(0, [Math]::Min(30, $MongoDbSecret.Length)))..." -ForegroundColor $Yellow
    } else {
        Write-Host "❌ MongoDB URI secret not found or empty" -ForegroundColor $Red
        Write-Host "Please run the setup-secrets.ps1 script first to configure MongoDB" -ForegroundColor $Yellow
        exit 1
    }
} catch {
    Write-Host "❌ Failed to retrieve MongoDB URI secret" -ForegroundColor $Red
    Write-Host "Please run the setup-secrets.ps1 script first to configure MongoDB" -ForegroundColor $Yellow
    exit 1
}

# Test MongoDB connection
Write-Host "`nTesting MongoDB connection..." -ForegroundColor $Yellow
Set-Location "../server"

# Create a temporary test script
$TestFile = "test-mongodb.js"
$TestContent = @"
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = '$MongoDbSecret';

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...');
    console.log('URI format:', MONGODB_URI.substring(0, 30) + '...');
    
    await mongoose.connect(MONGODB_URI, { 
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 10000,
      connectTimeoutMS: 10000
    });
    
    console.log('✅ MongoDB connection successful');
    console.log('Database:', mongoose.connection.name);
    console.log('Host:', mongoose.connection.host);
    console.log('Port:', mongoose.connection.port);
    
    // Test basic operations
    console.log('Testing database operations...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name).join(', '));
    
    await mongoose.connection.close();
    console.log('Connection closed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    console.error('Name:', error.name);
    process.exit(1);
  }
}

testConnection();
"@

# Write the test file
$TestContent | Out-File -FilePath $TestFile -Encoding UTF8

# Run the test
Write-Host "Running connection test..." -ForegroundColor $Yellow
node $TestFile
if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ MongoDB connection test passed!" -ForegroundColor $Green
    Write-Host "Your MongoDB is properly configured and accessible." -ForegroundColor $Green
} else {
    Write-Host "`n❌ MongoDB connection test failed!" -ForegroundColor $Red
    Write-Host "Please check:" -ForegroundColor $Yellow
    Write-Host "  1. MongoDB URI format and credentials" -ForegroundColor $Yellow
    Write-Host "  2. Network connectivity to MongoDB server" -ForegroundColor $Yellow
    Write-Host "  3. MongoDB server is running and accessible" -ForegroundColor $Yellow
    Write-Host "  4. Firewall/security group settings" -ForegroundColor $Yellow
}

# Clean up test file
Remove-Item $TestFile -ErrorAction SilentlyContinue
Set-Location "../aws-deployment"

Write-Host "`nTest completed." -ForegroundColor $Yellow 