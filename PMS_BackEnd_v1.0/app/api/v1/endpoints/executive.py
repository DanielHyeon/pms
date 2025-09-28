from __future__ import annotations

from fastapi import APIRouter, Depends

from app.core.security import get_current_active_user
from app.schemas.executive import ExecutiveSnapshot
from app.utils.data_store import DataStore, get_datastore

router = APIRouter()


@router.get("/", response_model=ExecutiveSnapshot)
async def get_executive_snapshot(
    current_user: dict = Depends(get_current_active_user),
    datastore: DataStore = Depends(get_datastore),
) -> ExecutiveSnapshot:
    snapshot = datastore.get_executive_snapshot()
    return ExecutiveSnapshot(**snapshot)
