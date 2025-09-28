from __future__ import annotations

from typing import List

from pydantic import BaseModel


class BudgetItem(BaseModel):
    id: str
    projectId: str
    projectName: str
    department: str
    category: str
    plannedAmount: float
    actualAmount: float
    approvedAmount: float
    remainingAmount: float
    startDate: str
    endDate: str
    status: str
    description: str
    manMonths: float
    hourlyRate: float
    actualHours: float


class BudgetSummary(BaseModel):
    totalPlanned: float
    totalActual: float
    totalApproved: float
    totalRemaining: float
    utilizationRate: float
    variancePercentage: float
    projectCount: int


class BudgetTrendPoint(BaseModel):
    month: str
    planned: float
    actual: float


class BudgetOverview(BaseModel):
    summary: BudgetSummary
    items: List[BudgetItem]
    trend: List[BudgetTrendPoint]
