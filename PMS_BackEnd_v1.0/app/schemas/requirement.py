from __future__ import annotations

from typing import Optional

from pydantic import BaseModel


class Requirement(BaseModel):
    id: str
    reqIdString: str
    trackingNumber: Optional[str] = None
    title: str
    description: str
    status: str
    projectId: str
    createdAt: str
    updatedAt: str


class RequirementCreate(BaseModel):
    title: str
    description: str
    status: str = "defined"
    trackingNumber: Optional[str] = None


class RequirementUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    trackingNumber: Optional[str] = None
