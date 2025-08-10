variable "environment" {
  description = "Environment name"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "private_subnets" {
  description = "Private subnet IDs"
  type        = list(string)
}

variable "public_subnets" {
  description = "Public subnet IDs"
  type        = list(string)
}

variable "app_image" {
  description = "Docker image for the application"
  type        = string
}

variable "app_port" {
  description = "Port exposed by the docker image"
  type        = number
}

variable "app_count" {
  description = "Number of docker containers to run"
  type        = number
}

variable "app_cpu" {
  description = "CPU units for the application"
  type        = number
  default     = 256
}

variable "app_memory" {
  description = "Memory for the application"
  type        = number
  default     = 512
}

variable "health_check_path" {
  description = "Health check path for the application"
  type        = string
}

variable "alb_arn" {
  description = "Application Load Balancer ARN"
  type        = string
  default     = ""
}

variable "alb_security_group_id" {
  description = "Application Load Balancer Security Group ID"
  type        = string
  default     = ""
}

variable "acm_certificate_arn" {
  description = "ACM Certificate ARN for HTTPS listener"
  type        = string
  default     = ""
} 