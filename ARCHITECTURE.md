# Smart Job Platform - Architecture Guidelines

## Overview

This document defines the Clean Architecture guidelines and patterns for the Smart Job Platform monorepo.

## Technology Stack

| Layer          | Technology           | Purpose                                      |
| -------------- | -------------------- | -------------------------------------------- |
| **Backend**    | NestJS + TypeScript  | REST API, WebSocket handlers, business logic |
| **Frontend**   | Next.js + TypeScript | Web application, SSR, SSG                    |
| **Mobile**     | Flutter + Dart       | Cross-platform mobile application            |
| **AI Service** | Python FastAPI       | ML inference, semantic matching              |
| **Database**   | PostgreSQL + PostGIS | Primary data store with geospatial support   |
| **Cache**      | Redis                | Session, cache, real-time pub/sub            |
| **Auth**       | JWT                  | Stateless authentication                     |

## Directory Structure

```
smartjob/
├── shared/                    # Shared packages
│   ├── src/
│   │   ├── schemas/          # Zod validation schemas
│   │   └── index.ts         # Common types, utilities
│   └── dist/                # Compiled output
│
├── backend/                  # NestJS application
│   └── src/
│       ├── modules/         # Feature modules
│       │   ├── auth/
│       │   ├── users/
│       │   ├── jobs/
│       │   ├── matching/
│       │   ├── location/
│       │   ├── notifications/
│       │   ├── payments/
│       │   └── admin/
│       ├── common/          # Shared utilities
│       │   ├── decorators/
│       │   ├── filters/
│       │   ├── guards/
│       │   ├── interceptors/
│       │   └── pipes/
│       ├── database/        # TypeORM entities, migrations
│       ├── config/           # Configuration modules
│       └── main.ts
│
├── frontend/                # Next.js application
│   └── src/
│       ├── app/             # Next.js App Router pages
│       ├── components/      # React components
│       │   ├── ui/          # Base UI components
│       │   ├── features/    # Feature-specific components
│       │   └── layouts/     # Layout components
│       ├── lib/             # Utilities, API clients
│       ├── hooks/           # Custom React hooks
│       ├── stores/          # State management
│       ├── i18n/            # Internationalization
│       └── styles/          # Global styles
│
├── mobile/                  # Flutter application (placeholder)
│   └── lib/
│       ├── core/            # App configuration, theme
│       ├── features/        # Feature modules
│       ├── shared/          # Shared widgets, utilities
│       └── l10n/            # Localization
│
└── ai-service/              # Python FastAPI service
    └── app/
        ├── api/             # API routes
        ├── core/            # Configuration
        ├── services/        # ML services
        └── models/          # Pydantic models
```

## Clean Architecture Layers

### Backend (NestJS)

```
┌─────────────────────────────────────────┐
│           Presentation Layer             │
│  (Controllers, DTOs, OpenAPI/Swagger)   │
├─────────────────────────────────────────┤
│           Application Layer              │
│  (Services, Use Cases, CQRS Handlers)   │
├─────────────────────────────────────────┤
│             Domain Layer                 │
│  (Entities, Value Objects, Interfaces)  │
├─────────────────────────────────────────┤
│          Infrastructure Layer             │
│  (Database, External APIs, Caching)     │
└─────────────────────────────────────────┘
```

#### Layer Responsibilities

1. **Presentation (Controllers)**
   - Handle HTTP requests/responses
   - Input validation via class-validator/Zod
   - Authentication/authorization guards
   - Rate limiting
   - Response serialization

2. **Application (Services)**
   - Business logic orchestration
   - Transaction management
   - Event publishing
   - Caching strategies
   - Logging and monitoring

3. **Domain (Entities)**
   - Business rules and invariants
   - Value objects for type safety
   - Domain events
   - Repository interfaces

4. **Infrastructure (Repositories)**
   - Database access (TypeORM/Prisma)
   - External service integrations
   - Cache implementation
   - File storage

### Mobile (Flutter)

```
┌─────────────────────────────────────────┐
│            Presentation Layer            │
│     (Widgets, Screens, ViewModels)       │
├─────────────────────────────────────────┤
│            Domain Layer                  │
│      (Entities, Use Cases, Repos)        │
├─────────────────────────────────────────┤
│             Data Layer                   │
│   (Models, Repositories, Data Sources)   │
└─────────────────────────────────────────┘
```

## Naming Conventions

### TypeScript

| Type                   | Convention          | Example                   |
| ---------------------- | ------------------- | ------------------------- |
| Files                  | kebab-case          | `user-profile.service.ts` |
| Classes                | PascalCase          | `UserService`             |
| Interfaces             | PascalCase + prefix | `IUserRepository`         |
| Types                  | PascalCase          | `UserProfile`             |
| Enums                  | PascalCase          | `UserRole`                |
| Constants              | UPPER_SNAKE_CASE    | `MAX_RETRY_COUNT`         |
| Variables              | camelCase           | `userProfile`             |
| Functions              | camelCase           | `getUserById`             |
| Private methods        | camelCase + prefix  | `_validateInput`          |
| Angular/NestJS modules | PascalCase          | `AuthModule`              |
| DTOs                   | PascalCase + suffix | `CreateUserDto`           |

### Python (AI Service)

| Type      | Convention       | Example              |
| --------- | ---------------- | -------------------- |
| Files     | snake_case       | `user_repository.py` |
| Classes   | PascalCase       | `UserRepository`     |
| Functions | snake_case       | `get_user_by_id`     |
| Variables | snake_case       | `user_profile`       |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT`    |
| Private   | prefix `_`       | `_internal_method`   |

### Database

| Object       | Convention         | Example                 |
| ------------ | ------------------ | ----------------------- |
| Tables       | snake_case, plural | `user_profiles`         |
| Columns      | snake_case         | `created_at`            |
| Primary Keys | `id`               | `id UUID PRIMARY KEY`   |
| Foreign Keys | `*_id`             | `user_id`               |
| Indexes      | `idx_*`            | `idx_users_email`       |
| Constraints  | `chk_*`            | `chk_users_email_valid` |

## TypeScript Strict Mode Configuration

All projects MUST use strict TypeScript with these settings enforced:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitReturns": true,
    "noImplicitOverride": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true
  }
}
```

## Shared Validation Schemas

All entities are defined using Zod in the `shared` package:

- **User**: Job seekers, employers, and admin users
- **Job**: Job postings with location, salary, and benefits
- **Application**: Job applications with status tracking
- **Analytics**: System and employer analytics data
- **Admin**: Administrative actions and moderation

Schema files are the single source of truth for validation across backend, frontend, and mobile.

## API Design

### REST Endpoints

```
GET    /api/v1/jobs              - List jobs
POST   /api/v1/jobs              - Create job
GET    /api/v1/jobs/:id          - Get job by ID
PATCH  /api/v1/jobs/:id          - Update job
DELETE /api/v1/jobs/:id          - Delete job

GET    /api/v1/jobs/:id/applications    - List applications for job
POST   /api/v1/applications             - Submit application
GET    /api/v1/applications/:id         - Get application
PATCH  /api/v1/applications/:id/status  - Update status
```

### Response Format

```typescript
// Success
{
  success: true,
  data: T,
  message?: string,
  timestamp: string
}

// Error
{
  statusCode: number,
  message: string,
  error: string,
  details?: Record<string, unknown>,
  timestamp: string
}

// Paginated
{
  data: T[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number,
    hasNextPage: boolean,
    hasPrevPage: boolean
  }
}
```

## Environment Variables

See `.env.example` for required variables. Never commit `.env` files.

## Geospatial Considerations

- All coordinates stored as `[longitude, latitude]` (GeoJSON format)
- Use PostGIS functions for distance calculations
- Radius search: `ST_DWithin(location, point, radius_in_meters)`
- Distance calculation: `ST_Distance(location, point)`

## Internationalization (i18n)

- Supported locales: `en` (LTR), `ar` (RTL)
- Use `next-intl` for Next.js
- All user-facing strings must be translatable
- Date/time formatting via `date-fns`

## Testing Strategy

- **Unit Tests**: Individual functions/classes
- **Integration Tests**: API endpoints with real DB
- **E2E Tests**: Full user workflows

## Security Considerations

- JWT tokens with short expiry (15 min access, 7 day refresh)
- Rate limiting on auth endpoints
- Input sanitization (Zod)
- SQL injection prevention (TypeORM parameterized queries)
- XSS prevention (React auto-escaping)
- CORS configuration
- Helmet security headers

## Performance

- Redis caching for frequently accessed data
- Database indexes on:
  - `user_profiles.email` (unique)
  - `jobs.employer_id`
  - `jobs.status`
  - `jobs.location` (PostGIS GIST)
  - `applications.job_id`
  - `applications.applicant_id`
- Pagination on all list endpoints
- Optimistic UI updates

## Deployment

- Backend: Docker container with multi-stage build
- Frontend: Vercel or Docker (Next.js can be containerized)
- AI Service: Docker container
- Database: Managed PostgreSQL (Cloud SQL, RDS) or self-hosted

## Git Workflow

1. Create feature branch from `main`
2. Follow conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`
3. Submit PR with description
4. CI/CD runs tests, linting, type checking
5. Code review and approval
6. Merge to `main`
7. Auto-deploy to staging/production

## Contributing

1. Read this architecture document
2. Follow naming conventions
3. Run `npm run lint` and `npm run typecheck` before committing
4. Write tests for new features
5. Update documentation as needed
