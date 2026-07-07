import logging

from fastapi import APIRouter, Depends, HTTPException
from app.config.settings import settings
from app.data_ingest.csv_ingest import (
    load_documents_from_csv
)
from app.dependencies.auth_dependencies import get_current_user
from app.models.auth_models import UserResponse
from app.models.ingest_models import (
    IngestResponse,
)
from app.services.search_service import SearchService

router = APIRouter(prefix=settings.api_prefix, tags=["ingest"])
logger = logging.getLogger(__name__)

search_service = SearchService()


@router.post("/ingest/sample-data", response_model=IngestResponse)
def ingest_sample_data(current_user: UserResponse = Depends(get_current_user)) -> IngestResponse:
    logger.info("Sample ingest requested.", extra={"user_id": current_user.email})
    try:
        documents = load_documents_from_csv("data/ai_tooling_catalog.csv")
        logger.info(
            "CSV documents loaded for ingest.",
            extra={"user_id": current_user.email, "document_count": len(documents)},
        )
        indexed_count = search_service.bulk_index_documents(documents)
        logger.info(
            "Sample ingest completed.",
            extra={"user_id": current_user.email, "indexed_count": indexed_count},
        )
        return IngestResponse(
            indexed_count=indexed_count,
            indexed_name=settings.elasticsearch_index,
            source_file="data/ai_tooling_catalog.csv",
        )
    except Exception as exc:
        logger.exception("Sample ingest failed.", extra={"user_id": current_user.email})
        raise HTTPException(status_code=500, detail=str(exc)) from exc
