import logging
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config.settings import settings
from app.routers import auth, health, ingest, chat
from app.logging_config import configure_uvicorn_logging

configure_uvicorn_logging()
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.app_name,
    version="0.0.1",
    description="multi-model-agent backend"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.backend_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(ingest.router)
app.include_router(chat.router)


logger.info(
    "Application startup configured.",
    extra={
        "app_name": settings.app_name,
        "api_prefix": settings.api_prefix,
        "llm_provider": settings.llm_provider,
        "elastic_index": settings.elasticsearch_index,
    },
)