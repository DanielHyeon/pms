from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.security import get_current_active_user
from app.schemas.requirement import Requirement, RequirementCreate, RequirementUpdate
from app.utils.data_store import DataStore, get_datastore

router = APIRouter()


@router.get("/{project_id}/requirements", response_model=List[Requirement])
async def list_requirements(
    project_id: str,
    current_user: dict = Depends(get_current_active_user),
    datastore: DataStore = Depends(get_datastore),
) -> List[Requirement]:
    requirements = datastore.list_requirements(project_id)
    return [Requirement(**req) for req in requirements]


@router.post("/{project_id}/requirements", response_model=Requirement, status_code=status.HTTP_201_CREATED)
async def create_requirement(
    project_id: str,
    payload: RequirementCreate,
    current_user: dict = Depends(get_current_active_user),
    datastore: DataStore = Depends(get_datastore),
) -> Requirement:
    requirement = datastore.create_requirement(project_id, payload.dict(exclude_unset=True))
    return Requirement(**requirement)


@router.put("/{project_id}/requirements/{requirement_id}", response_model=Requirement)
async def update_requirement(
    project_id: str,
    requirement_id: str,
    payload: RequirementUpdate,
    current_user: dict = Depends(get_current_active_user),
    datastore: DataStore = Depends(get_datastore),
) -> Requirement:
    updated = datastore.update_requirement(requirement_id, payload.dict(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Requirement not found")
    return Requirement(**updated)
