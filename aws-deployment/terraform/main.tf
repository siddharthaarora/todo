terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  backend "s3" {
    bucket = "todo-app-terraform-state-992487937364"
    key    = "terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "todo-app"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

# VPC and Networking
module "vpc" {
  source = "./modules/vpc"
  
  environment = var.environment
  vpc_cidr    = var.vpc_cidr
}

# ECS Cluster and Services
module "ecs" {
  source = "./modules/ecs"
  
  environment     = var.environment
  vpc_id          = module.vpc.vpc_id
  private_subnets = module.vpc.private_subnets
  public_subnets  = module.vpc.public_subnets
  
  app_image      = var.app_image
  app_port       = var.app_port
  app_count      = var.app_count
  health_check_path = var.health_check_path
  
  alb_arn = module.alb.alb_arn
  alb_security_group_id = module.alb.security_group_id
  
  depends_on = [module.vpc, module.alb]
}

# S3 for static files
module "s3" {
  source = "./modules/s3"
  
  environment = var.environment
  domain_name = var.domain_name
}

# CloudFront for CDN
module "cloudfront" {
  source = "./modules/cloudfront"
  
  environment = var.environment
  domain_name = var.domain_name
  s3_bucket_id = module.s3.bucket_id
  s3_bucket_arn = module.s3.bucket_arn
  s3_bucket_regional_domain_name = module.s3.bucket_regional_domain_name
  
  depends_on = [module.s3]
}

# Application Load Balancer
module "alb" {
  source = "./modules/alb"
  
  environment     = var.environment
  vpc_id          = module.vpc.vpc_id
  public_subnets  = module.vpc.public_subnets
  
  depends_on = [module.vpc]
}

# Route 53 (if custom domain)
module "route53" {
  source = "./modules/route53"
  
  count        = var.domain_name != "" ? 1 : 0
  environment  = var.environment
  domain_name  = var.domain_name
  alb_dns_name = module.alb.alb_dns_name
  alb_zone_id  = module.alb.alb_zone_id
  cloudfront_domain = module.cloudfront.cloudfront_domain
  
  depends_on = [module.alb, module.cloudfront]
}

# Outputs
output "alb_dns_name" {
  value = module.alb.alb_dns_name
}

output "cloudfront_domain" {
  value = module.cloudfront.cloudfront_domain
}

output "s3_bucket_name" {
  value = module.s3.bucket_name
}

output "ecs_cluster_name" {
  value = module.ecs.cluster_name
} 








