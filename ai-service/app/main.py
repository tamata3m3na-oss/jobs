from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router as api_router
from app.core.config import settings

def get_application() -> FastAPI:
    application = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
    )

    application.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    application.include_router(api_router, prefix=settings.API_V1_STR)

    return application

app = get_application()

@app.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok", "service": "ai-service"}

@app.get("/health/ready")
async def readiness_check() -> dict[str, str]:
    """Readiness check - verifies service is ready to handle requests."""
    return {"status": "ready", "service": "ai-service"}

@app.get("/health/live")
async def liveness_check() -> dict[str, str]:
    """Liveness check for Kubernetes."""
    return {"status": "alive", "service": "ai-service"}
