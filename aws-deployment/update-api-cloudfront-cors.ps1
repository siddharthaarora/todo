# Update API CloudFront Distribution with CORS Support
Write-Host "🔄 Updating API CloudFront Distribution with CORS Support..." -ForegroundColor Yellow

# Get the current distribution config
$distributionId = "ESVSL7U1YJ4MI"
Write-Host "Getting current distribution config for: $distributionId"

$currentConfig = aws cloudfront get-distribution-config --id $distributionId --query 'DistributionConfig' --output json
$etag = aws cloudfront get-distribution-config --id $distributionId --query 'ETag' --output text

# Update the configuration with CORS headers
$updatedConfig = Get-Content "api-cloudfront-cors.json" | ConvertFrom-Json

# Update the distribution
Write-Host "Updating CloudFront distribution..."
$updatedConfigJson = $updatedConfig | ConvertTo-Json -Depth 10

# Save to temporary file
$updatedConfigJson | Out-File -FilePath "temp-config.json" -Encoding UTF8

# Update the distribution
aws cloudfront update-distribution --id $distributionId --distribution-config file://temp-config.json --if-match $etag

# Clean up
Remove-Item "temp-config.json" -ErrorAction SilentlyContinue

Write-Host "✅ API CloudFront distribution updated with CORS support" -ForegroundColor Green
Write-Host "⏳ Waiting for deployment to complete..."

# Wait for deployment
aws cloudfront wait distribution-deployed --id $distributionId

Write-Host "✅ CloudFront distribution deployment completed" -ForegroundColor Green


