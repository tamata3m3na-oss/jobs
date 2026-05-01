# API Documentation

The Smart Job Platform API is a RESTful API built with NestJS.

## Base URL

`http://localhost:3000/api/v1`

## Authentication

Most endpoints require a JWT token in the `Authorization` header:
`Authorization: Bearer <your_token>`

## Global Response Format

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "timestamp": "2024-05-20T10:00:00.000Z"
}
```

## Endpoints

### 1. Auth Module

- `POST /auth/register`: Register a new user.
- `POST /auth/login`: Authenticate and receive tokens.
- `POST /auth/refresh`: Get a new access token using a refresh token.
- `POST /auth/logout`: Invalidate the current session.
- `GET /auth/me`: Get current user profile.

### 2. Jobs Module

- `GET /jobs`: List jobs with filters (search, category, location, radius).
- `POST /jobs`: Create a new job listing (Employer only).
- `GET /jobs/:id`: Get detailed job information.
- `PATCH /jobs/:id`: Update a job listing.
- `DELETE /jobs/:id`: Remove a job listing.
- `GET /jobs/employer/me`: List jobs posted by the current employer.
- `GET /admin/jobs`: List all jobs for moderation (Admin only).

### 3. Applications Module

- `POST /applications`: Submit an application to a job.
- `GET /applications/:id`: Get application details.
- `PATCH /applications/:id/status`: Update application status (e.g., Shortlisted, Interviewing).
- `GET /applications/job/:jobId`: List all applications for a specific job.
- `GET /applications/me`: List all applications submitted by the current job seeker.

### 4. Users Module

- `GET /users/profile`: Get the current user's profile data.
- `PATCH /users/profile`: Update profile information.
- `POST /users/resume`: Upload and parse a resume.

### 5. Matching Module

- `GET /matching/job/:jobId`: Get ranked candidates for a specific job.
- `GET /matching/recommendations`: Get recommended jobs for the current user.
- `GET /matching/skill-gap/:jobId`: Get skill gap analysis for a specific job.

### 6. Analytics Module

- `GET /analytics/employer`: Get hiring statistics for the current employer.
- `GET /analytics/admin`: Get system-wide platform statistics.

### 7. Payments Module

- `POST /payments/create-checkout-session`: Start a Stripe payment flow.
- `POST /payments/webhook`: Handle Stripe asynchronous events (internal).

## Error Handling

The API uses standard HTTP status codes:

- `400 Bad Request`: Validation errors or malformed requests.
- `401 Unauthorized`: Authentication missing or invalid.
- `403 Forbidden`: Insufficient permissions (role-based).
- `404 Not Found`: Resource does not exist.
- `500 Internal Server Error`: Unexpected server errors.
