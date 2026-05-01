# System Workflows & User Journeys

This document outlines the core workflows and user journeys within the Smart Job Platform.

## 1. Authentication & Onboarding

### Flow: New User Registration

1. **User Choice**: User selects their role (Job Seeker or Employer).
2. **Registration**: User provides email, password, and basic details.
3. **Verification**: Email verification (if enabled) and initial profile setup.
4. **Token Issuance**: System issues JWT Access and Refresh tokens.
5. **Onboarding**:
   - **Job Seeker**: Uploads resume -> AI parses resume -> Skills extracted.
   - **Employer**: Enters company details -> Verification by Admin (optional).

## 2. Job Seeker Journey

### Journey: Finding and Applying for a Job

1. **Discovery**:
   - Browse jobs by category or location (Geospatial search).
   - View "Recommended Jobs" based on AI matching with their profile.
2. **Evaluation**:
   - Job Seeker views job details, salary range, and benefits.
   - AI provides a "Match Score" and highlights "Skill Gaps".
3. **Application**:
   - User submits application (Resume + optional cover letter).
   - If the job has "Screening Questions", the user answers them.
4. **Tracking**:
   - User monitors application status (Applied, Interviewing, Offered, Rejected).
   - Real-time notifications when status changes.

## 3. Employer Journey

### Journey: Hiring Talent

1. **Job Posting**:
   - Employer creates job listing with requirements.
   - System suggests screening questions based on the job description.
2. **Candidate Management (ATS)**:
   - Employer views applicants sorted by AI Match Score.
   - **Blind Hiring Mode**: Employer can toggle to hide personal candidate info to avoid bias.
3. **Screening**:
   - Employer reviews AI-parsed resume data and screening question answers.
   - System evaluates screening answers automatically.
4. **Progression**:
   - Employer moves candidates through stages (Shortlist, Interview, Offer).

## 4. Admin Journey

### Journey: Platform Governance

1. **Moderation**:
   - Review and approve new Employer accounts.
   - Flag/Remove inappropriate job postings or profiles.
2. **Analytics**:
   - Monitor system health and user activity.
   - View platform-wide metrics (Total jobs, application success rates).
3. **Configuration**:
   - Manage categories, skills database, and system settings.

## 5. Technical Workflows

### AI Matching Workflow

1. **Trigger**: Job posted or Job Seeker profile updated.
2. **Embedding**: AI Service generates embeddings for the job/resume text.
3. **Vector Search**: System calculates cosine similarity between job and candidate embeddings.
4. **Ranking**: Results are ranked and cached in Redis for fast retrieval.

### Application Lifecycle

- `PENDING`: Application submitted, waiting for employer review.
- `REVIEWING`: Employer has opened the application.
- `SHORTLISTED`: Candidate moved to the next stage.
- `INTERVIEWING`: Interview scheduled.
- `OFFERED`: Employment offer extended.
- `ACCEPTED / REJECTED`: Final state of the application.

### Payment & Subscription

1. **Employer Selects Plan**: Stripe Checkout session initiated.
2. **Webhook**: Stripe sends `checkout.session.completed`.
3. **Activation**: Backend updates employer's subscription status and enables premium features.

## 6. Error Flows

- **Authentication Failure**: Return `401 Unauthorized` -> Frontend redirects to login.
- **Token Expiry**: Frontend uses Refresh Token to obtain a new Access Token.
- **Validation Error**: Zod catches invalid input -> Return `400 Bad Request` with field-specific errors.
- **Service Downtime**: Graceful degradation (e.g., if AI Service is down, matching scores are hidden but applications still work).
