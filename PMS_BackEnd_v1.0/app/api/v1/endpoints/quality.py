from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from app.core.security import get_current_active_user
from app.schemas.quality import (
    CodeAnalysisSummary,
    FileQuality,
    QualityMetrics,
    QualityOverview,
    QualityTrendPoint,
)
from app.utils.data_store import DataStore, get_datastore

router = APIRouter()


@router.get("/{project_id}/quality", response_model=QualityOverview)
async def get_quality_overview(
    project_id: str,
    current_user: dict = Depends(get_current_active_user),
    datastore: DataStore = Depends(get_datastore),
) -> QualityOverview:
    metrics = datastore.get_quality_metrics(project_id)
    if not metrics:
        raise HTTPException(status_code=404, detail="Quality metrics not found")

    trend = datastore.get_quality_trends(project_id)
    files = datastore.get_file_quality(project_id)
    analysis = datastore.get_code_analysis(project_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Code analysis summary not found")

    return QualityOverview(
        metrics=QualityMetrics(**metrics),
        trend=[QualityTrendPoint(**point) for point in trend],
        files=[FileQuality(**file_quality) for file_quality in files],
        analysis=CodeAnalysisSummary(**analysis),
    )
