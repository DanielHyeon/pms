from __future__ import annotations

from typing import Optional

from pydantic import BaseModel


class TaskBase(BaseModel):
    id: str
    projectId: str
    title: str
    description: str
    status: str
    assignee: str | None = None
    priority: str
    createdAt: str
    requirementId: str | None = None
    parentTaskId: str | None = None


class Task(TaskBase):
    pass


class TaskCreate(BaseModel):
    title: str
    description: str | None = None
    status: str = "todo"
    assignee: str | None = None
    priority: str = "medium"
    requirementId: str | None = None
    parentTaskId: str | None = None
    createdAt: str | None = None


class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    status: str | None = None
    assignee: str | None = None
    priority: str | None = None
    requirementId: str | None = None
    parentTaskId: str | None = None
