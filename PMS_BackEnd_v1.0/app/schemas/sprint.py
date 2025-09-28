from __future__ import annotations

from typing import Optional

from pydantic import BaseModel


class Sprint(BaseModel):
    id: str
    projectId: str
    name: str
    goal: str
    status: str
    startDate: str
    endDate: str
    capacity: int
    commitment: int
    completed: int
    createdAt: str


class SprintCreate(BaseModel):
    name: str
    goal: str
    status: str = "planning"
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    capacity: int = 0
    commitment: int = 0
    completed: int = 0
