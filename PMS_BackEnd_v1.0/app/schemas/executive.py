from __future__ import annotations

from typing import List

from pydantic import BaseModel


class KPI(BaseModel):
    id: str
    title: str
    value: float
    target: float
    unit: str
    trend: str
    trendValue: float
    description: str
    category: str


class PortfolioEntry(BaseModel):
    projectId: str
    projectName: str
    department: str
    budget: float
    spent: float
    completion: float
    status: str
    roi: float
    startDate: str
    endDate: str


class TrendPoint(BaseModel):
    month: str
    revenue: float
    cost: float
    projects: int
    completion: float


class ExecutiveSnapshot(BaseModel):
    kpis: List[KPI]
    portfolio: List[PortfolioEntry]
    trend: List[TrendPoint]
