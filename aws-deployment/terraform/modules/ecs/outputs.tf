output "cluster_name" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.main.name
}

output "cluster_arn" {
  description = "ECS cluster ARN"
  value       = aws_ecs_cluster.main.arn
}

output "service_name" {
  description = "ECS service name"
  value       = var.alb_arn != "" ? aws_ecs_service.app[0].name : ""
}

output "service_arn" {
  description = "ECS service ARN"
  value       = var.alb_arn != "" ? aws_ecs_service.app[0].id : ""
}

output "task_definition_arn" {
  description = "ECS task definition ARN"
  value       = aws_ecs_task_definition.app.arn
}

output "security_groups" {
  description = "Security group IDs"
  value       = [aws_security_group.ecs_tasks.id]
}

output "target_group_arn" {
  description = "Target group ARN"
  value       = var.alb_arn != "" ? aws_lb_target_group.app[0].arn : ""
} 