# Route53 DNS Configuration for Custom Domain

# Get the hosted zone for the domain
data "aws_route53_zone" "main" {
  name = var.domain_name
}

# Create A record for the ALB
resource "aws_route53_record" "api" {
  count = var.domain_name != "" ? 1 : 0
  
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "api.${var.domain_name}"
  type    = "A"

  alias {
    name                   = var.alb_dns_name
    zone_id                = var.alb_zone_id
    evaluate_target_health = true
  }
}

# Create A record for the CloudFront distribution
resource "aws_route53_record" "app" {
  count = var.domain_name != "" ? 1 : 0
  
  zone_id = data.aws_route53_zone.main.zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = var.cloudfront_domain
    zone_id                = "Z2FDTNDATAQYW2" # CloudFront hosted zone ID (global)
    evaluate_target_health = false
  }
}

# Create www subdomain record
resource "aws_route53_record" "www" {
  count = var.domain_name != "" ? 1 : 0
  
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "www.${var.domain_name}"
  type    = "A"

  alias {
    name                   = var.cloudfront_domain
    zone_id                = "Z2FDTNDATAQYW2" # CloudFront hosted zone ID (global)
    evaluate_target_health = false
  }
} 