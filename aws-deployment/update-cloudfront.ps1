# Update CloudFront Distribution to include ALB origin and API cache behavior
param(
    [string]$AwsRegion = "us-east-1",
    [string]$DistributionId = "E13F2ONDCDDVC",
    [string]$AlbDnsName = "production-alb-1629828006.us-east-1.elb.amazonaws.com"
)

Write-Host "Updating CloudFront distribution $DistributionId to include ALB origin..." -ForegroundColor Green

# Get the current distribution configuration
Write-Host "Getting current distribution configuration..." -ForegroundColor Yellow
$distribution = aws cloudfront get-distribution --id $DistributionId --region $AwsRegion --output json
$config = $distribution.Distribution.DistributionConfig

# Add ALB origin
Write-Host "Adding ALB origin..." -ForegroundColor Yellow
$albOrigin = @{
    Id = "ALB-$AlbDnsName"
    DomainName = $AlbDnsName
    OriginPath = ""
    CustomHeaders = @{
        Quantity = 0
    }
    CustomOriginConfig = @{
        HTTPPort = 80
        HTTPSPort = 443
        OriginProtocolPolicy = "http-only"
        OriginSSLProtocols = @{
            Quantity = 1
            Items = @("TLSv1.2")
        }
        OriginReadTimeout = 30
        OriginKeepaliveTimeout = 5
    }
    ConnectionAttempts = 3
    ConnectionTimeout = 10
    OriginShield = @{
        Enabled = $false
    }
    OriginAccessControlId = ""
}

# Add the ALB origin to the origins list
$config.Origins.Items += $albOrigin
$config.Origins.Quantity = $config.Origins.Items.Count

# Add API cache behavior
Write-Host "Adding API cache behavior..." -ForegroundColor Yellow
$apiCacheBehavior = @{
    PathPattern = "/api/*"
    TargetOriginId = "ALB-$AlbDnsName"
    TrustedSigners = @{
        Enabled = $false
        Quantity = 0
    }
    TrustedKeyGroups = @{
        Enabled = $false
        Quantity = 0
    }
    ViewerProtocolPolicy = "redirect-to-https"
    AllowedMethods = @{
        Quantity = 7
        Items = @("DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT")
        CachedMethods = @{
            Quantity = 2
            Items = @("GET", "HEAD")
        }
    }
    SmoothStreaming = $false
    Compress = $false
    LambdaFunctionAssociations = @{
        Quantity = 0
    }
    FunctionAssociations = @{
        Quantity = 0
    }
    FieldLevelEncryptionId = ""
    GrpcConfig = @{
        Enabled = $false
    }
    ForwardedValues = @{
        QueryString = $true
        Cookies = @{
            Forward = "all"
        }
        Headers = @{
            Quantity = 1
            Items = @("*")
        }
        QueryStringCacheKeys = @{
            Quantity = 0
        }
    }
    MinTTL = 0
    DefaultTTL = 0
    MaxTTL = 0
}

# Add the API cache behavior to the cache behaviors list
$config.CacheBehaviors.Items += $apiCacheBehavior
$config.CacheBehaviors.Quantity = $config.CacheBehaviors.Items.Count

# Update the distribution
Write-Host "Updating CloudFront distribution..." -ForegroundColor Yellow
$configJson = $config | ConvertTo-Json -Depth 10

# Save the config to a temporary file
$tempFile = "cloudfront-config-temp.json"
$configJson | Out-File -FilePath $tempFile -Encoding UTF8

try {
    aws cloudfront update-distribution --id $DistributionId --distribution-config file://$tempFile --region $AwsRegion
    Write-Host "✅ CloudFront distribution updated successfully!" -ForegroundColor Green
    Write-Host "Note: Changes may take 5-10 minutes to propagate globally." -ForegroundColor Yellow
} catch {
    Write-Host "❌ Error updating CloudFront distribution: $_" -ForegroundColor Red
} finally {
    # Clean up temporary file
    if (Test-Path $tempFile) {
        Remove-Item $tempFile
    }
} 