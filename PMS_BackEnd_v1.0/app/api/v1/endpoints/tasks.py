from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.security import get_current_active_user
from app.schemas.task import Task, TaskCreate, TaskUpdate
from app.utils.data_store import DataStore, get_datastore

router = APIRouter()


@router.get("/{project_id}/tasks", response_model=List[Task])
async def list_tasks(
    project_id: str,
    current_user: dict = Depends(get_current_active_user),
    datastore: DataStore = Depends(get_datastore),
) -> List[Task]:
    project = datastore.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    tasks = datastore.list_tasks(project_id)
    return [Task(**task) for task in tasks]


@router.post("/{project_id}/tasks", response_model=Task, status_code=status.HTTP_201_CREATED)
async def create_task(
    project_id: str,
    payload: TaskCreate,
    current_user: dict = Depends(get_current_active_user),
    datastore: DataStore = Depends(get_datastore),
) -> Task:
    project = datastore.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    task = datastore.create_task(project_id, payload.dict(exclude_unset=True))
    return Task(**task)


@router.put("/{project_id}/tasks/{task_id}", response_model=Task)
async def update_task(
    project_id: str,
    task_id: str,
    payload: TaskUpdate,
    current_user: dict = Depends(get_current_active_user),
    datastore: DataStore = Depends(get_datastore),
) -> Task:
    updated = datastore.update_task(task_id, payload.dict(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Task not found")
    return Task(**updated)


@router.delete("/{project_id}/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    project_id: str,
    task_id: str,
    current_user: dict = Depends(get_current_active_user),
    datastore: DataStore = Depends(get_datastore),
):
    deleted = datastore.delete_task(task_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Task not found")
