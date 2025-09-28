from __future__ import annotations

from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class Integration(BaseModel):
    id: str
    name: str
    description: str
    category: str
    status: str
    isEnabled: bool
    lastSync: Optional[str] = None
    features: List[str]
    config: Dict[str, Any]
    webhookUrl: Optional[str] = None


class IntegrationUpdate(BaseModel):
    status: Optional[str] = None
    isEnabled: Optional[bool] = None
    config: Optional[Dict[str, Any]] = None
    webhookUrl: Optional[str] = None


class IntegrationLog(BaseModel):
    id: str
    integrationId: str
    type: str
    message: str
    timestamp: str
    status: str
    details: Dict[str, Any] | None = None
