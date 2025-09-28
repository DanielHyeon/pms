from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, HTTPException

from app.core.security import get_current_active_user
from app.schemas.project import Project, ProjectList
from app.utils.data_store import DataStore, get_datastore

router = APIRouter()


def _filter_projects_for_user(projects: List[dict], user: dict) -> List[dict]:
    role = user.get("role")
    user_id = user.get("id")
    user_project_ids = set(user.get("projects", []))

    if role == "system_admin":
        return projects

    if role == "project_manager":
        return [
            project
            for project in projects
            if project.get("managerId") == user_id or project.get("id") in user_project_ids
        ]

    return [
        project
        for project in projects
        if user_id in project.get("teamMembers", []) or project.get("id") in user_project_ids
    ]


@router.get("/", response_model=ProjectList)
async def list_projects(
    current_user: dict = Depends(get_current_active_user),
    datastore: DataStore = Depends(get_datastore),
) -> ProjectList:
    projects = datastore.list_projects()
    filtered = _filter_projects_for_user(projects, current_user)
    return ProjectList(items=[Project(**project) for project in filtered])


@router.get("/{project_id}", response_model=Project)
async def get_project(
    project_id: str,
    current_user: dict = Depends(get_current_active_user),
    datastore: DataStore = Depends(get_datastore),
) -> Project:
    project = datastore.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if project not in _filter_projects_for_user(datastore.list_projects(), current_user):
        raise HTTPException(status_code=403, detail="Not enough permissions")

    return Project(**project)
