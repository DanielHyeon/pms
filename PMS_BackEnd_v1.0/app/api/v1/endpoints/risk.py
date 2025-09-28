from __future__ import annotations

import random
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException

from app.core.security import get_current_active_user
from app.schemas.risk import RiskInsight, RiskOverview, RiskSnapshot
from app.utils.data_store import DataStore, get_datastore

router = APIRouter()


@router.get("/{project_id}/risk", response_model=RiskOverview)
async def get_risk_overview(
    project_id: str,
    current_user: dict = Depends(get_current_active_user),
    datastore: DataStore = Depends(get_datastore),
) -> RiskOverview:
    snapshot = datastore.get_risk_snapshot(project_id)
    if not snapshot:
        raise HTTPException(status_code=404, detail="Risk snapshot not found")

    insights = datastore.list_risk_insights(project_id)
    return RiskOverview(
        snapshot=RiskSnapshot(**snapshot),
        insights=[RiskInsight(**insight) for insight in insights],
    )


@router.post("/{project_id}/risk/refresh", response_model=RiskOverview)
async def refresh_risk_overview(
    project_id: str,
    current_user: dict = Depends(get_current_active_user),
    datastore: DataStore = Depends(get_datastore),
) -> RiskOverview:
    snapshot = datastore.get_risk_snapshot(project_id)
    if not snapshot:
        raise HTTPException(status_code=404, detail="Risk snapshot not found")

    # Simulate a lightweight AI re-run by nudging the score a little.
    jitter = random.uniform(-2, 2)
    snapshot["overallRiskScore"] = max(0, min(100, snapshot["overallRiskScore"] + jitter))
    snapshot["completionProbability"] = max(0, min(100, snapshot["completionProbability"] - jitter))
    snapshot["refreshedAt"] = datetime.utcnow().isoformat()

    insights = datastore.list_risk_insights(project_id)
    return RiskOverview(
        snapshot=RiskSnapshot(**snapshot),
        insights=[RiskInsight(**insight) for insight in insights],
    )
