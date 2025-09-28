from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.security import get_current_active_user
from app.schemas.backlog import BacklogItem, BacklogItemCreate
from app.utils.data_store import DataStore, get_datastore

router = APIRouter()


@router.get("/{project_id}/backlog-items", response_model=List[BacklogItem])
async def list_backlog_items(
    project_id: str,
    current_user: dict = Depends(get_current_active_user),
    datastore: DataStore = Depends(get_datastore),
) -> List[BacklogItem]:
    items = datastore.list_backlog_items(project_id)
    return [BacklogItem(**item) for item in items]


@router.post("/{project_id}/backlog-items", response_model=BacklogItem, status_code=status.HTTP_201_CREATED)
async def create_backlog_item(
    project_id: str,
    payload: BacklogItemCreate,
    current_user: dict = Depends(get_current_active_user),
    datastore: DataStore = Depends(get_datastore),
) -> BacklogItem:
    project = datastore.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    item = datastore.create_backlog_item(project_id, payload.dict(exclude_unset=True))
    return BacklogItem(**item)
