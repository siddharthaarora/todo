output "bucket_id" {
  description = "S3 bucket ID"
  value       = aws_s3_bucket.static_website.id
}

output "bucket_arn" {
  description = "S3 bucket ARN"
  value       = aws_s3_bucket.static_website.arn
}

output "bucket_name" {
  description = "S3 bucket name"
  value       = aws_s3_bucket.static_website.bucket
}

output "website_endpoint" {
  description = "S3 website endpoint"
  value       = aws_s3_bucket_website_configuration.static_website.website_endpoint
}

output "bucket_regional_domain_name" {
  description = "S3 bucket regional domain name"
  value       = aws_s3_bucket.static_website.bucket_regional_domain_name
} 