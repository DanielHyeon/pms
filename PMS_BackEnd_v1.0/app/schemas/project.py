from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel

from app.schemas.user import UserPublic


class ProjectBudget(BaseModel):
    planned: float
    actual: float
    currency: str


class ProjectKPI(BaseModel):
    onTimeDelivery: float
    budgetAdherence: float
    qualityScore: float
    teamSatisfaction: float


class ProjectBase(BaseModel):
    id: str
    name: str
    description: str
    ownerId: str
    managerId: str
    teamMembers: List[str]
    department: str
    status: str
    priority: str
    createdAt: str
    deadline: Optional[str] = None
    taskCount: int
    budget: Optional[ProjectBudget] = None
    kpis: Optional[ProjectKPI] = None


class Project(ProjectBase):
    pass


class ProjectList(BaseModel):
    items: List[Project]
