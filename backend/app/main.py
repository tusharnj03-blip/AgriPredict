"""
AgriPredict AI - FastAPI Backend
Indian Crop Yield Prediction & Agricultural Risk Intelligence Platform
"""
import logging
import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import init_db

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    stream=sys.stdout,
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    logger.info("[AgriPredict] Starting AgriPredict AI Backend...")
    try:
        init_db()
        logger.info("[OK] Database initialized")
        # Bootstrap admin account if DB is empty and env vars are set
        try:
            from app.services.seeder import auto_seed
            auto_seed()
        except Exception as e:
            logger.warning(f"Bootstrap skipped: {e}")
    except Exception as e:
        logger.error(f"[ERROR] Startup failed: {e}")
        raise
    yield
    logger.info("[STOP] Shutting down AgriPredict AI Backend")


app = FastAPI(
    title="AgriPredict AI",
    description="Indian Crop Yield Prediction & Agricultural Risk Intelligence Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Request logging middleware ───────────────────────────────────────────────
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f">> {request.method} {request.url.path}")
    response = await call_next(request)
    logger.info(f"<< {response.status_code} {request.url.path}")
    return response


# ─── HTTP Exception passthrough ──────────────────────────────────────────────
from fastapi import HTTPException

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers=getattr(exc, "headers", None),
    )


# ─── Global error handler ─────────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_error_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error at {request.url.path}: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error. Please try again."}
    )


# ─── Health check ─────────────────────────────────────────────────────────────
@app.get("/api/health")
async def health_check():
    from app.database import engine
    import sqlalchemy
    try:
        with engine.connect() as conn:
            conn.execute(sqlalchemy.text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"

    return {
        "status": "healthy",
        "database": db_status,
        "version": "1.0.0",
    }


# ─── Register routers ─────────────────────────────────────────────────────────
from app.routes.auth import router as auth_router
from app.routes.users import router as users_router
from app.routes.farms import router as farms_router
from app.routes.predictions import router as predictions_router
from app.routes.risk import router, crop_router, soil_router
from app.routes.misc import (
    weather_router, market_router, alerts_router,
    activity_router, simulation_router, disease_router,
)
from app.routes.reports import reports_router
from app.routes.admin import router as admin_router

API_PREFIX = "/api"

app.include_router(auth_router, prefix=API_PREFIX)
app.include_router(users_router, prefix=API_PREFIX)
app.include_router(farms_router, prefix=API_PREFIX)
app.include_router(predictions_router, prefix=API_PREFIX)
app.include_router(router, prefix=API_PREFIX)       # risk
app.include_router(crop_router, prefix=API_PREFIX)
app.include_router(soil_router, prefix=API_PREFIX)
app.include_router(weather_router, prefix=API_PREFIX)
app.include_router(market_router, prefix=API_PREFIX)
app.include_router(alerts_router, prefix=API_PREFIX)
app.include_router(activity_router, prefix=API_PREFIX)
app.include_router(simulation_router, prefix=API_PREFIX)
app.include_router(disease_router, prefix=API_PREFIX)
app.include_router(reports_router, prefix=API_PREFIX)
app.include_router(admin_router, prefix=API_PREFIX)


@app.get("/")
async def root():
    return {
        "name": "AgriPredict AI API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/health",
    }
