# WellBank Healthcare Platform

A unified digital healthcare coordination platform for Africa, connecting patients to healthcare providers with seamless service discovery, care coordination, and wallet-based payments.

## Architecture

- **Backend**: NestJS modular monolith with TypeScript
- **Frontend**: Next.js 14 with App Router (to be added)
- **Shared**: TypeScript contracts and types
- **Database**: PostgreSQL with TypeORM
- **Cache/Jobs**: Redis with BullMQ
- **Key Management**: HashiCorp Vault
- **File Storage**: S3-compatible (MinIO for dev, Cloudflare R2 for prod)

## Project Structure

```
wellbank-monorepo/
├── backend/           # NestJS backend application
│   ├── src/
│   │   ├── config/    # Configuration files
│   │   ├── modules/   # Feature modules (to be added)
│   │   └── main.ts    # Application entry point
│   └── package.json
├── frontend/          # Next.js frontend (to be added)
├── shared/            # Shared TypeScript types and contracts
│   ├── src/
│   │   ├── enums.ts
│   │   ├── interfaces.ts
│   │   └── validation.ts
│   └── package.json
├── docker-compose.yml # Development services
└── package.json       # Monorepo root
```

## Prerequisites

- Node.js 20+ and npm
- Docker and Docker Compose
- Git

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd wellbank-monorepo
```

### 2. Install dependencies

```bash
npm run install:all
```

### 3. Start development services

Start PostgreSQL, Redis, Vault, MinIO, and MailHog:

```bash
docker-compose up -d
```

Verify all services are running:

```bash
docker-compose ps
```

### 4. Configure environment variables

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your configuration (defaults work for local development).

### 5. Build shared types

```bash
npm run shared:build
```

### 6. Start the backend

```bash
npm run backend:dev
```

The API will be available at:

- API: http://localhost:3000/api/v1
- Swagger Docs: http://localhost:3000/api/v1/docs

### 7. Access development tools

- **PostgreSQL**: localhost:5432
  - User: `wellbank`
  - Password: `wellbank_dev_password`
  - Database: `wellbank_dev`

- **Redis**: localhost:6379

- **Vault UI**: http://localhost:8200
  - Token: `dev-only-token`

- **MinIO Console**: http://localhost:9001
  - User: `minioadmin`
  - Password: `minioadmin`

- **MailHog UI**: http://localhost:8025

## Development Workflow

### Running the backend

```bash
# Development mode with hot reload
npm run backend:dev

# Production build
npm run backend:build
npm run backend:start
```

### Running tests

```bash
cd backend

# Unit tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:cov

# E2E tests
npm run test:e2e
```

### Building shared types

After modifying shared types:

```bash
npm run shared:build
```

## API Documentation

Once the backend is running, visit:

- Swagger UI: http://localhost:3000/api/v1/docs
- OpenAPI JSON: http://localhost:3000/api/v1/docs-json

## Key Features

### Implemented (Task 1)

- ✅ Monorepo structure with workspaces
- ✅ Shared TypeScript contracts
- ✅ NestJS modular monolith setup
- ✅ TypeORM with PostgreSQL
- ✅ Docker Compose for services
- ✅ Swagger/OpenAPI documentation
- ✅ Centralized configuration service
- ✅ Winston logging with intelligent filtering
- ✅ BullMQ for background jobs
- ✅ EventEmitter2 for cross-module communication

### To Be Implemented

- Authentication and user management
- Patient profiles and medical records
- Doctor discovery and consultations
- Laboratory services
- Pharmacy integration
- Wallet and payments (BudPay)
- Insurance integration
- Emergency services
- Notifications
- Admin portal
- Next.js frontend

## Technology Stack

### Backend

- NestJS 10
- TypeScript 5
- TypeORM
- PostgreSQL 16
- Redis 7
- BullMQ
- Winston
- Passport.js + JWT
- Swagger/OpenAPI

### Infrastructure

- Docker & Docker Compose
- HashiCorp Vault
- MinIO (S3-compatible)
- MailHog (dev email)

### Planned Integrations

- BudPay (payments)
- Dojah (KYC/identity verification)
- WebRTC (telehealth)
- Socket.io (real-time)

## Security

- AES-256 encryption for medical records
- JWT authentication with Redis storage
- HashiCorp Vault for key management
- HIPAA-like data protection
- NDPR compliance
- TLS 1.3 for all communications
- Rate limiting and helmet security headers

## Contributing

1. Create a feature branch
2. Make your changes
3. Write tests
4. Submit a pull request

## License

Proprietary - WellBank Team

## Support

For questions or issues, contact the development team.
