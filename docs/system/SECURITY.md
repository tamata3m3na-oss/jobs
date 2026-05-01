# Security Documentation

The Smart Job Platform implements multiple layers of security to protect user data and ensure system integrity.

## 1. Authentication

- **JWT (JSON Web Tokens)**: Used for stateless authentication.
  - **Access Tokens**: Short-lived (e.g., 15 minutes) for active sessions.
  - **Refresh Tokens**: Long-lived (e.g., 7 days), stored securely to issue new access tokens.
- **Bcrypt**: All passwords are hashed using Bcrypt before being stored in the database.
- **Multi-Role RBAC**: Strict Role-Based Access Control (Admin, Employer, Job Seeker).

## 2. API Security

- **Rate Limiting**: Applied to sensitive endpoints (Login, Register, Forgot Password) to prevent brute-force attacks.
- **Helmet**: Uses the `helmet` middleware in NestJS to set various security-related HTTP headers (XSS Protection, Content Security Policy, etc.).
- **CORS**: Configured with a strict whitelist of allowed origins.
- **Input Validation**: All incoming data is validated using **Zod** or **class-validator** schemas to prevent injection and malformed data.
- **Request Sanitization**: Strips unwanted HTML/scripts from user inputs.

## 3. Data Protection

- **Parameterized Queries**: Using Prisma ORM ensures all database queries are parameterized, preventing SQL Injection.
- **Blind Hiring Mode**: A specialized feature to reduce unconscious bias. When enabled:
  - Candidate names, photos, and gender are hidden from employers during the initial review.
  - Focuses solely on skills and experience.
- **Encryption at Rest**: Sensitive database volumes should be encrypted at the infrastructure level.
- **Audit Logging**: All critical actions (e.g., salary changes, user deletions, status updates) are recorded in the `AuditLog` table.

## 4. Infrastructure Security

- **Docker**: Services are isolated within containers.
- **Environment Variables**: Sensitive keys (Stripe API, Database credentials, JWT Secret) are never committed to version control and are managed via `.env` files or secret managers.
- **HTTPS**: TLS/SSL should be enforced at the Load Balancer/Reverse Proxy level in production.

## 5. Third-Party Integrations

- **Stripe**: No credit card data is stored on our servers. All payment processing is handled by Stripe via secure Webhooks and hosted Checkout sessions.
- **Security Scans**: Regular dependency scanning for known vulnerabilities (e.g., `npm audit`, `snyk`).

## Security Best Practices for Developers

1.  **Never Use `any`**: Ensure strict typing to prevent runtime type errors that could lead to security leaks.
2.  **Validate Everything**: Never trust client-side data. Always re-validate on the backend.
3.  **Least Privilege**: Give users and services only the permissions they absolutely need.
4.  **Keep Dependencies Updated**: Regularly run `npm update` and check for security patches.
