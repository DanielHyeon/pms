from __future__ import annotations

from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class AIReportSection(BaseModel):
    title: str
    content: str


class AIReportRequest(BaseModel):
    projectId: str
    reportType: str = "status"
    audience: str = "executive"


class AIReportResponse(BaseModel):
    projectId: str
    summary: str
    sections: List[AIReportSection]
    generatedAt: str


class ChatMessage(BaseModel):
    id: str
    type: str
    content: str
    timestamp: str
    suggestions: Optional[List[str]] = None
    data: Optional[Dict[str, Any]] = None


class ChatRequest(BaseModel):
    projectId: str
    message: str


class ChatResponse(BaseModel):
    messages: List[ChatMessage]
