from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends

from app.core.security import get_current_active_user
from app.schemas.budget import BudgetItem, BudgetOverview, BudgetSummary, BudgetTrendPoint
from app.utils.data_store import DataStore, get_datastore

router = APIRouter()


@router.get("/", response_model=BudgetOverview)
async def get_budget_overview(
    current_user: dict = Depends(get_current_active_user),
    datastore: DataStore = Depends(get_datastore),
) -> BudgetOverview:
    items_raw = datastore.list_budget_items()
    items = [BudgetItem(**item) for item in items_raw]

    total_planned = sum(item.plannedAmount for item in items)
    total_actual = sum(item.actualAmount for item in items)
    total_approved = sum(item.approvedAmount for item in items)
    total_remaining = sum(item.remainingAmount for item in items)

    utilization_rate = (total_actual / total_approved * 100) if total_approved else 0
    variance_percentage = (
        ((total_actual - total_planned) / total_planned * 100) if total_planned else 0
    )

    summary = BudgetSummary(
        totalPlanned=total_planned,
        totalActual=total_actual,
        totalApproved=total_approved,
        totalRemaining=total_remaining,
        utilizationRate=round(utilization_rate, 2),
        variancePercentage=round(variance_percentage, 2),
        projectCount=len(items),
    )

    trend = [BudgetTrendPoint(**point) for point in datastore.get_budget_trend()]

    return BudgetOverview(summary=summary, items=items, trend=trend)
