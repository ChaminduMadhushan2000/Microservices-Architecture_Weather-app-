# Cloud-Native Microservices Weather Platform ☁️

A fully containerized, microservices-based weather application deployed on AWS. This project demonstrates modern Cloud Infrastructure, DevOps automation, and secure networking practices using Docker, Terraform, and GitHub Actions.



## 🏗️ Architecture Overview

The platform is designed with isolated services communicating through a centralized Nginx API Gateway, eliminating cross-origin resource sharing (CORS) complexity and direct client-to-backend coupling.

* **Frontend:** React (Vite) Single Page Application (SPA).
* **Location Service (Backend):** Node.js API responsible for geocoding city names into coordinates.
* **Weather Service (Backend):** Node.js API responsible for fetching meteorological data based on coordinates.
* **API Gateway (Nginx):** Acts as a reverse proxy on Port 80, serving static frontend builds at `/` and routing API requests to `/api/*` internal endpoints.
* **Infrastructure:** AWS EC2 and VPC provisioned via Terraform with strict Security Groups.

## 🚀 Tech Stack

* **Cloud & Infrastructure as Code (IaC):** AWS (EC2, VPC), Terraform
* **Containerization:** Docker, Docker Compose
* **CI/CD:** GitHub Actions
* **Backend:** Node.js, Express
* **Frontend:** React, Vite
* **Web Server / Proxy:** Nginx

## ✨ Key Engineering Highlights

* **Automated CI/CD Pipeline:** Engineered a zero-downtime GitHub Actions workflow that executes SSH-based in-place deployments, automated Docker rebuilds, and health checks on a live EC2 instance.
* **Immutable Infrastructure:** Provisioned reproducible AWS environments using Terraform, enforcing least-privilege ingress (HTTP 80 / SSH 22) and IMDSv2 metadata protection to prevent SSRF attacks.
* **Security & History Remediation:** Executed a critical security cleanup using `git filter-branch` to purge 718MB of leaked Terraform state binaries and private SSH keys from Git history (99.9% size reduction), followed by live cryptographic key rotation on the production server.
* **Optimized Container Networking:** Resolved Docker bridge network scoping issues by binding the Vite dev server to `0.0.0.0` and rewriting all frontend data fetches to leverage relative Nginx proxy routes.

## 🛠️ Local Development Setup

### Prerequisites
* Docker and Docker Compose installed.
* Node.js v18+ (for local testing without containers).

### Running the Application
1. Clone the repository:
   ```bash
   git clone [https://github.com/ChaminduMadhushan2000/Microservices-Architecture_Weather-app-.git](https://github.com/ChaminduMadhushan2000/Microservices-Architecture_Weather-app-.git)
   cd Microservices-Architecture_Weather-app-
