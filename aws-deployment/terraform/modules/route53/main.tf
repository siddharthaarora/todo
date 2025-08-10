# Route53 DNS Configuration for Custom Domain

# Get the hosted zone for the domain
data "aws_route53_zone" "main" {
  name = var.domain_name
}

# ACM Certificate validation records
resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in var.acm_certificate_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = data.aws_route53_zone.main.zone_id
}

# Create A record for the ALB (API)
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

# Create A record for the CloudFront distribution (main domain)
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