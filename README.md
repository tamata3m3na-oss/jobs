# منصة التوظيف الذكية | Smart Job Platform

<div dir="rtl">

## نظرة عامة | Overview

منصة التوظيف الذكية هي منصة متكاملة لإدارة الوظائف تم تطويرها باستخدام أحدث التقنيات. تدعم البحث الذكي عن الوظائف، مطابقة المرشحين بالذكاء الاصطناعي، والتطبيقات ثنائية اللغة (العربية والإنجليزية).

Smart Job Platform is a comprehensive job management platform built with modern technologies. It supports intelligent job search, AI-powered candidate matching, and bilingual support (English and Arabic).

## الميزات | Features

- 🔐 **نظام مصادقة متعدد الأدوار** | Multi-role Authentication System (Job Seekers, Employers, Admins)
- 📋 **إدارة الوظائف** | Job Management (CRUD with geospatial search using PostGIS)
- 🤖 **مطابقة بالذكاء الاصطناعي** | AI-Powered Matching (Semantic search with sentence transformers)
- 📊 **لوحات تحكم متقدمة** | Advanced Dashboards (Admin, Employer, Analytics)
- 🔔 **إشعارات فورية** | Real-time Notifications (WebSocket/Socket.io)
- 🌐 **دعم اللغات المتعددة** | Internationalization (RTL for Arabic, LTR for English)
- 💳 **معالجة المدفوعات** | Payment Processing (Stripe integration)
- 📱 **تطبيقات الويب والموبايل** | Web & Mobile Apps (Next.js + Flutter)

## البنية التقنية | Tech Stack

| الخدمة         | Technology              | المنفذ | Port                 |
| -------------- | ----------------------- | ------ | -------------------- |
| **Backend**    | NestJS + TypeScript     | 3000   | REST API + WebSocket |
| **Frontend**   | Next.js 14 + TypeScript | 3001   | Web Application      |
| **AI Service** | Python FastAPI          | 8000   | ML Inference         |
| **Mobile**     | Flutter + Dart          | -      | Cross-platform App   |
| **Database**   | PostgreSQL + PostGIS    | 5432   | Primary Data Store   |
| **Cache**      | Redis 7                 | 6379   | Sessions & Pub/Sub   |

## هيكل المشروع | Project Structure

```
smartjob/
├── shared/           # Zod schemas & shared types
├── backend/          # NestJS REST API
├── frontend/         # Next.js Web Application
├── mobile/           # Flutter Mobile App
├── ai-service/       # Python FastAPI ML Service
├── docs/             # Additional documentation
├── docker-compose.yml
└── README.md
```

## المتطلبات | Requirements

- Node.js >= 20.0.0
- npm >= 10.0.0
- Docker & Docker Compose
- PostgreSQL 16+ with PostGIS
- Redis 7+

## التثبيت | Installation

### باستخدام Docker (موصى به) | Using Docker (Recommended)

```bash
# استنساخ المشروع | Clone the repository
git clone <repository-url>
cd smartjob

# نسخ ملف البيئة | Copy environment file
cp .env.example .env

# تشغيل جميع الخدمات | Start all services
docker-compose up -d

# التحقق من الخدمات | Check services status
docker-compose ps
```

الخدمات ستعمل على المنافذ التالية | Services will run on the following ports:

- Frontend: http://localhost:3001
- Backend API: http://localhost:3000
- API Docs: http://localhost:3000/docs
- AI Service: http://localhost:8000
- PostgreSQL: localhost:5432
- Redis: localhost:6379

### التثبيت محلياً | Local Installation

```bash
# تثبيت الاعتماديات | Install dependencies
npm install

# بناء الحزم المشتركة | Build shared packages
npm run build

# نسخ ملف البيئة | Copy environment file
cp .env.example .env

# تعديل ملف .env للاتصال بقواعد البيانات محلياً
# Edit .env to point to local databases
```

#### تشغيل الخدمات | Running Services

**Backend:**

```bash
cd backend
npm run dev
```

**Frontend:**

```bash
cd frontend
npm run dev
```

**AI Service:**

```bash
cd ai-service
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## البيئة | Environment

راجع `.env.example` للمتغيرات المطلوبة. لا تلتزم بملفات `.env`.

See `.env.example` for required variables. Never commit `.env` files.

### متغيرات البيئة الأساسية | Key Environment Variables

| المتغير          | Variable                     | الوصف                      | Description |
| ---------------- | ---------------------------- | -------------------------- | ----------- |
| `DATABASE_URL`   | PostgreSQL connection string | سلسلة اتصال قاعدة البيانات |
| `REDIS_URL`      | Redis connection string      | سلسلة اتصال Redis          |
| `JWT_SECRET`     | JWT signing secret           | سر توقيع JWT               |
| `STRIPE_API_KEY` | Stripe API key               | مفتاح Stripe API           |

## API Documentation

عند تشغيل Backend، الوثائق متاحة على:

When the backend is running, documentation is available at:

- Swagger UI: http://localhost:3000/docs
- OpenAPI JSON: http://localhost:3000/docs-json

## التطوير | Development

### بناء الحزم | Building Packages

```bash
# بناء جميع الحزم | Build all packages
npm run build

# فحص الأنواع | Type checking
npm run typecheck

# تشغيل linter | Linting
npm run lint
```

### المعايير | Standards

- TypeScript Strict Mode مفعّل
- Clean Architecture للمكونات
- Zod للتحقق من البيانات
- Conventional Commits للتعليقات

- TypeScript Strict Mode enabled
- Clean Architecture for components
- Zod for validation
- Conventional Commits for messages

## النشر | Deployment

### Docker Production Build

```bash
# Backend
docker build -f backend/Dockerfile -t smartjob-backend .

# Frontend
docker build -f frontend/Dockerfile -t smartjob-frontend .

# All services
docker-compose -f docker-compose.yml up -d
```

### متغيرات الإنتاج | Production Variables

ضروري تحديث المتغيرات التالية قبل النشر:

Update these variables before deployment:

- `JWT_SECRET` - استخدم سر قوي | Use a strong secret
- `DATABASE_PASSWORD` - كلمة مرور قاعدة بيانات قوية | Strong DB password
- `REDIS_PASSWORD` - كلمة مرور Redis قوية | Strong Redis password
- `STRIPE_API_KEY` - مفتاح Stripe production | Production key

## الترخيص | License

MIT License

## المساهمة | Contributing

1. اقرأ `ARCHITECTURE.md` للتعرف على المعايير
2. اتبع Conventional Commits
3. شغّل `npm run lint` و `npm run typecheck` قبل الالتزام
4. اكتب اختبارات للميزات الجديدة

5. Read `ARCHITECTURE.md` for guidelines
6. Follow Conventional Commits
7. Run `npm run lint` and `npm run typecheck` before committing
8. Write tests for new features

</div>
