from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel


class BacklogItem(BaseModel):
    id: str
    projectId: str
    title: str
    description: str
    storyPoints: int
    priority: str
    status: str
    assignee: Optional[str] = None
    requirementId: Optional[str] = None
    sprintId: Optional[str] = None
    type: str
    acceptance_criteria: List[str]
    createdAt: str


class BacklogItemCreate(BaseModel):
    title: str
    description: str
    storyPoints: int = 0
    priority: str = "medium"
    status: str = "backlog"
    assignee: Optional[str] = None
    requirementId: Optional[str] = None
    sprintId: Optional[str] = None
    type: str = "task"
    acceptance_criteria: List[str] = []
