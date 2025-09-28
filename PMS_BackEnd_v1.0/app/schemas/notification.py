from __future__ import annotations

from typing import Any, Dict, List

from pydantic import BaseModel


class Notification(BaseModel):
    id: str
    type: str
    category: str
    title: str
    message: str
    timestamp: str
    read: bool
    actionable: bool
    priority: str
    data: Dict[str, Any] | None = None


class NotificationList(BaseModel):
    items: List[Notification]
