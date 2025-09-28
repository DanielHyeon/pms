from __future__ import annotations

from typing import List

from pydantic import BaseModel


class RiskSnapshot(BaseModel):
    predictedCompletionDate: str
    delayDays: int
    overallRiskScore: float
    completionProbability: float
    totalTasks: int
    completedTasks: int
    highRiskTasks: int
    teamUtilization: float


class RiskInsight(BaseModel):
    id: str
    type: str
    title: str
    description: str
    impact: str
    actionable: bool


class RiskOverview(BaseModel):
    snapshot: RiskSnapshot
    insights: List[RiskInsight]
