from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.security import get_current_active_user
from app.schemas.sprint import Sprint, SprintCreate
from app.utils.data_store import DataStore, get_datastore

router = APIRouter()


@router.get("/{project_id}/sprints", response_model=List[Sprint])
async def list_sprints(
    project_id: str,
    current_user: dict = Depends(get_current_active_user),
    datastore: DataStore = Depends(get_datastore),
) -> List[Sprint]:
    sprints = datastore.list_sprints(project_id)
    return [Sprint(**sprint) for sprint in sprints]


@router.post("/{project_id}/sprints", response_model=Sprint, status_code=status.HTTP_201_CREATED)
async def create_sprint(
    project_id: str,
    payload: SprintCreate,
    current_user: dict = Depends(get_current_active_user),
    datastore: DataStore = Depends(get_datastore),
) -> Sprint:
    project = datastore.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    sprint = datastore.create_sprint(project_id, payload.dict(exclude_unset=True))
    return Sprint(**sprint)
