terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

variable "region" {
  type    = string
  default = "us-east-1"
}

variable "instance_type" {
  type    = string
  default = "t3.micro"
}

provider "aws" {
  region = var.region
}

data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "architecture"
    values = ["x86_64"]
  }
}

resource "aws_security_group" "weather_sg" {
  name        = "weather_microservices_sg"
  description = "Allow SSH + app traffic"

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Frontend"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Backend services"
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "weather-microservices-sg"
    Environment = "dev"
  }
}

# 1. Upload the Public Key to AWS
resource "aws_key_pair" "deployer_key" {
  key_name   = "weather-server-key"
  public_key = file("weather_key.pub")
}

resource "aws_instance" "weather_server" {
  ami                         = data.aws_ami.ubuntu.id
  instance_type               = var.instance_type
  associate_public_ip_address = true

  # 2. FIX: We hardcode the link to ensure the lock is actually put on the door
  key_name = aws_key_pair.deployer_key.key_name

  vpc_security_group_ids = [aws_security_group.weather_sg.id]

  metadata_options {
    http_tokens = "required"
  }

  # 3. Automatically pull your code and start the Docker containers
  user_data = <<-EOF
              #!/bin/bash
              set -euo pipefail
              
              # Install prerequisites
              apt-get update -y
              apt-get install -y docker.io docker-compose-v2 git
              systemctl enable --now docker
              usermod -aG docker ubuntu

              # Clone your GitHub repository
              cd /home/ubuntu
              git clone https://github.com/ChaminduMadhushan2000/Microservices-Architecture_Weather-app-.git weather-app
              chown -R ubuntu:ubuntu /home/ubuntu/weather-app

              # Start the application
              cd weather-app
              docker compose up --build -d
              EOF

  tags = {
    Name        = "Weather-Microservices-Server"
    Environment = "dev"
  }
}

output "server_public_ip" {
  value       = aws_instance.weather_server.public_ip
  description = "The public IP address of the EC2 server"
}

output "security_group_id" {
  value       = aws_security_group.weather_sg.id
  description = "Security group protecting the server"
}
