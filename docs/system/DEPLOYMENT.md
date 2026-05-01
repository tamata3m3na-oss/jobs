# Deployment Guide

The Smart Job Platform is designed to be deployed using Docker and Docker Compose, making it portable across various cloud providers (AWS, Azure, GCP, DigitalOcean).

## 1. Production Prerequisites

- **Server**: At least 4GB RAM and 2 CPUs (AI models require some memory).
- **Domain**: A registered domain with SSL/TLS certificates.
- **External Services**:
  - **PostgreSQL**: Managed instance (e.g., RDS) or self-hosted with PostGIS.
  - **Redis**: Managed instance (e.g., ElastiCache) or self-hosted.
  - **Stripe**: Production API keys.
  - **Object Storage**: S3-compatible storage for resumes and profile pictures.

## 2. Environment Configuration

Create a `.env` file in the root directory. **Never commit this file.**

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/db_name"

# Redis
REDIS_URL="redis://:password@host:6379"

# Secrets
JWT_SECRET="generate-a-long-random-string"
JWT_REFRESH_SECRET="another-long-random-string"

# AI Service
AI_SERVICE_URL="http://ai-service:8000"

# Payments
STRIPE_API_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Frontend
NEXT_PUBLIC_API_URL="https://api.yourdomain.com/v1"
```

## 3. Docker Deployment (Recommended)

### Build and Run

```bash
# Pull/Build images and start services
docker-compose up -d --build
```

### Individual Service Builds

If you prefer building services separately:

- **Backend**: `docker build -f backend/Dockerfile -t smartjob-backend .`
- **Frontend**: `docker build -f frontend/Dockerfile -t smartjob-frontend .`
- **AI Service**: `docker build -f ai-service/Dockerfile -t smartjob-ai-service ./ai-service`

## 4. Kubernetes (Scaling)

For larger deployments, the platform can be orchestrated via Kubernetes (K8s).

- **Backend/Frontend/AI Service**: Deploy as separate `Deployments`.
- **PostgreSQL/Redis**: Use `StatefulSets` or managed cloud services.
- **Ingress**: Use an Ingress Controller (like Nginx) to handle routing and SSL termination.

## 5. Monitoring & Maintenance

- **Logging**: Use a centralized logging system (e.g., ELK Stack, Datadog, or CloudWatch).
- **Health Checks**:
  - Backend: `GET /api/v1/health` (if implemented) or check `/docs`.
  - AI Service: `GET /` or `/docs`.
- **Database Backups**: Schedule regular backups of the PostgreSQL volume.
- **Scaling**:
  - **Horizontal**: Scale the `backend` and `ai-service` replicas.
  - **Vertical**: Increase resources for the `ai-service` if processing large volumes of resumes.

## 6. Continuous Integration / Deployment (CI/CD)

The project includes GitHub Actions workflows (`.github/workflows/`) for:

- Automated linting and type checking.
- Running unit and integration tests.
- Building and pushing Docker images to a registry (e.g., GCR, ECR, Docker Hub).
