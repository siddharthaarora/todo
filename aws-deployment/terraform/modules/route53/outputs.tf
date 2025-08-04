output "zone_id" {
  description = "Route53 hosted zone ID"
  value       = data.aws_route53_zone.main.zone_id
}

output "api_record_name" {
  description = "API subdomain record name"
  value       = var.domain_name != "" ? "api.${var.domain_name}" : ""
}

output "app_record_name" {
  description = "App domain record name"
  value       = var.domain_name != "" ? var.domain_name : ""
} 