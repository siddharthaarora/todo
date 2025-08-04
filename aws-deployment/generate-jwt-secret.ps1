# JWT Secret Generator Script (PowerShell)
# This script generates a secure random JWT secret

param(
    [int]$Length = 64,
    [switch]$CopyToClipboard = $false
)

# Colors for output
$Green = "Green"
$Yellow = "Yellow"
$Red = "Red"

Write-Host "Generating JWT Secret..." -ForegroundColor $Green
Write-Host "Length: $Length characters" -ForegroundColor $Yellow

# Generate random JWT secret
$chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?"
$jwtSecret = ""

for ($i = 0; $i -lt $Length; $i++) {
    $jwtSecret += $chars[(Get-Random -Maximum $chars.Length)]
}

Write-Host "`nGenerated JWT Secret:" -ForegroundColor $Green
Write-Host "==========================================" -ForegroundColor $Yellow
Write-Host $jwtSecret -ForegroundColor $Green
Write-Host "==========================================" -ForegroundColor $Yellow

# Copy to clipboard if requested
if ($CopyToClipboard) {
    $jwtSecret | Set-Clipboard
    Write-Host "`nJWT secret copied to clipboard!" -ForegroundColor $Green
}

# Save to file
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$filename = "jwt-secret-$timestamp.txt"
$jwtSecret | Out-File -FilePath $filename -Encoding UTF8

Write-Host "`nJWT secret saved to: $filename" -ForegroundColor $Green

# Security recommendations
Write-Host "`nSecurity Recommendations:" -ForegroundColor $Yellow
Write-Host "1. Store this secret securely (AWS Secrets Manager)" -ForegroundColor $Yellow
Write-Host "2. Never commit secrets to version control" -ForegroundColor $Yellow
Write-Host "3. Use different secrets for different environments" -ForegroundColor $Yellow
Write-Host "4. Rotate secrets regularly" -ForegroundColor $Yellow

# Option to update AWS Secrets Manager directly
Write-Host "`nDo you want to update AWS Secrets Manager with this secret?" -ForegroundColor $Yellow
Write-Host "1. Yes, update AWS Secrets Manager" -ForegroundColor $Yellow
Write-Host "2. No, I'll do it manually" -ForegroundColor $Yellow

$choice = Read-Host "Enter your choice (1-2)"

if ($choice -eq "1") {
    Write-Host "`nUpdating AWS Secrets Manager..." -ForegroundColor $Yellow
    
    try {
        # Check AWS credentials
        aws sts get-caller-identity | Out-Null
        
        # Update the secret
        $secretJson = "{`"secret`":`"$jwtSecret`"}"
        aws secretsmanager update-secret --secret-id "production-jwt-secret" --secret-string $secretJson --region "us-east-1"
        
        Write-Host "JWT secret updated in AWS Secrets Manager!" -ForegroundColor $Green
        Write-Host "Secret name: production-jwt-secret" -ForegroundColor $Yellow
        
    } catch {
        Write-Host "Failed to update AWS Secrets Manager. Please check your AWS credentials." -ForegroundColor $Red
        Write-Host "You can manually update the secret later." -ForegroundColor $Yellow
    }
}

Write-Host "`nDone!" -ForegroundColor $Green 