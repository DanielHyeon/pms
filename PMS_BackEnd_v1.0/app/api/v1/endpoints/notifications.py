from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.security import get_current_active_user
from app.schemas.notification import Notification
from app.utils.data_store import DataStore, get_datastore

router = APIRouter()


@router.get("/{project_id}/notifications", response_model=List[Notification])
async def list_notifications(
    project_id: str,
    current_user: dict = Depends(get_current_active_user),
    datastore: DataStore = Depends(get_datastore),
) -> List[Notification]:
    notifications = datastore.list_notifications(project_id)
    return [Notification(**notification) for notification in notifications]


@router.post(
    "/{project_id}/notifications/{notification_id}/read",
    response_model=Notification,
    status_code=status.HTTP_200_OK,
)
async def mark_notification_read(
    project_id: str,
    notification_id: str,
    current_user: dict = Depends(get_current_active_user),
    datastore: DataStore = Depends(get_datastore),
) -> Notification:
    updated = datastore.mark_notification_read(project_id, notification_id)
    if not updated:
        raise HTTPException(status_code=404, detail="Notification not found")
    return Notification(**updated)
