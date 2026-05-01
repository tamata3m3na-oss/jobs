# منصة التوظيف الذكية | Smart Job Platform

<div dir="rtl">

## نظرة عامة | Overview

منصة التوظيف الذكية هي منصة متكاملة لإدارة الوظائف تم تطويرها باستخدام أحدث التقنيات. تدعم البحث الذكي عن الوظائف، مطابقة المرشحين بالذكاء الاصطناعي، والتطبيقات ثنائية اللغة (العربية والإنجليزية). تم تصميم النظام باستخدام هندسة نظيفة (Clean Architecture) لضمان القابلية للتوسع والصيانة.

Smart Job Platform is a comprehensive job management platform built with modern technologies. It supports intelligent job search, AI-powered candidate matching, and bilingual support (English and Arabic). The system is designed using Clean Architecture to ensure scalability and maintainability.

## الميزات | Features

- 🔐 **نظام مصادقة متعدد الأدوار** | Multi-role Authentication System (Job Seekers, Employers, Admins)
- 📋 **إدارة الوظائف** | Job Management (CRUD with geospatial search using PostGIS)
- 🤖 **مطابقة بالذكاء الاصطناعي** | AI-Powered Matching (Semantic search with sentence transformers)
- 📄 **تحليل السير الذاتية** | Resume Parsing (Extracting info from PDF/DOCX)
- 🧠 **تحليل فجوة المهارات** | Skill Gap Analysis (Recommendations for career growth)
- ❓ **توليد أسئلة الفحص** | AI Screening (Automatic question generation and evaluation)
- 📊 **لوحات تحكم متقدمة** | Advanced Dashboards (Admin, Employer, Analytics)
- 🔔 **إشعارات فورية** | Real-time Notifications (WebSocket/Socket.io)
- 🌐 **دعم اللغات المتعددة** | Internationalization (RTL for Arabic, LTR for English)
- 💳 **معالجة المدفوعات** | Payment Processing (Stripe integration)
- 📱 **تطبيقات الويب والموبايل** | Web & Mobile Apps (Next.js + Flutter)
- 🕵️ **التوظيف الأعمى** | Blind Hiring Mode (Anonymizing candidate data for unbiased hiring)

## البنية التقنية | Tech Stack

### Backend

- **Framework**: NestJS (TypeScript)
- **ORM**: Prisma with PostgreSQL
- **Geospatial**: PostGIS
- **Caching**: Redis
- **Documentation**: Swagger/OpenAPI

### Frontend

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **State Management**: React Context / Zustand
- **Internationalization**: next-intl

### Mobile

- **Framework**: Flutter (Dart)
- **State Management**: Riverpod
- **Architecture**: Clean Architecture (Data, Domain, Presentation)

### AI Service

- **Framework**: Python FastAPI
- **ML Libraries**: Sentence Transformers (PyTorch), spaCy
- **Document Processing**: PyMuPDF, python-docx

## هيكل المشروع | Project Structure

```
smartjob/
├── shared/           # Zod schemas & shared types (Single source of truth)
├── backend/          # NestJS REST API & WebSocket server
├── frontend/         # Next.js Web Application
├── mobile/           # Flutter Mobile Application
├── ai-service/       # Python FastAPI ML Service
├── docs/             # Comprehensive documentation
│   ├── system/       # Technical system documentation
│   └── specs/        # Original specifications
├── docker-compose.yml
└── README.md
```

## المتطلبات | Requirements

- Node.js >= 20.0.0
- npm >= 10.0.0
- Flutter SDK >= 3.19.0
- Python >= 3.10
- Docker & Docker Compose
- PostgreSQL 16+ with PostGIS
- Redis 7+

## التثبيت والتشغيل | Getting Started

### باستخدام Docker (الخيار الأسرع) | Using Docker (Fastest)

```bash
# استنساخ المشروع | Clone the repository
git clone <repository-url>
cd smartjob

# نسخ ملف البيئة | Copy environment file
cp .env.example .env

# تشغيل جميع الخدمات | Start all services
docker-compose up -d
```

### التثبيت المحلي للتطوير | Local Development Setup

1. **تثبيت الاعتماديات الأساسية | Install Root Dependencies:**

   ```bash
   npm install
   ```

2. **بناء الحزم المشتركة | Build Shared Packages:**

   ```bash
   npm run build
   ```

3. **تشغيل الخدمات الفردية | Running Individual Services:**
   - **Backend**: `cd backend && npm run dev`
   - **Frontend**: `cd frontend && npm run dev`
   - **AI Service**: `cd ai-service && uvicorn app.main:app --reload`
   - **Mobile**: `cd mobile && flutter run`

## التوثيق | Documentation

- **Architecture**: [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Workflows**: [WORKFLOW.md](./WORKFLOW.md)
- **API Reference**: [docs/system/API.md](./docs/system/API.md)
- **Mobile Guide**: [docs/system/MOBILE.md](./docs/system/MOBILE.md)
- **AI Service**: [docs/system/AI-SERVICE.md](./docs/system/AI-SERVICE.md)
- **Security**: [docs/system/SECURITY.md](./docs/system/SECURITY.md)
- **Deployment**: [docs/system/DEPLOYMENT.md](./docs/system/DEPLOYMENT.md)

## الترخيص | License

MIT License

</div>
