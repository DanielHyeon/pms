from __future__ import annotations

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.security import get_current_active_user
from app.schemas.integration import Integration, IntegrationLog, IntegrationUpdate
from app.utils.data_store import DataStore, get_datastore

router = APIRouter()


@router.get("/", response_model=List[Integration])
async def list_integrations(
    current_user: dict = Depends(get_current_active_user),
    datastore: DataStore = Depends(get_datastore),
) -> List[Integration]:
    integrations = datastore.list_integrations()
    return [Integration(**integration) for integration in integrations]


@router.patch("/{integration_id}", response_model=Integration)
async def update_integration(
    integration_id: str,
    payload: IntegrationUpdate,
    current_user: dict = Depends(get_current_active_user),
    datastore: DataStore = Depends(get_datastore),
) -> Integration:
    updated = datastore.update_integration(integration_id, payload.dict(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Integration not found")
    return Integration(**updated)


@router.get("/logs", response_model=List[IntegrationLog])
async def list_integration_logs(
    integration_id: Optional[str] = Query(default=None),
    current_user: dict = Depends(get_current_active_user),
    datastore: DataStore = Depends(get_datastore),
) -> List[IntegrationLog]:
    logs = datastore.list_integration_logs(integration_id)
    return [IntegrationLog(**log) for log in logs]
