from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class Token(BaseModel):
    access_token: str = Field(..., alias="accessToken")
    token_type: str = Field("bearer", alias="tokenType")
    expires_in: int = Field(..., alias="expiresIn")

    class Config:
        allow_population_by_field_name = True


class TokenPayload(BaseModel):
    sub: Optional[str] = None
    exp: Optional[int] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    token: Token
    user: "User"

    class Config:
        arbitrary_types_allowed = True


class RefreshTokenRequest(BaseModel):
    refresh_token: str


from app.schemas.user import User  # noqa: E402  # import at end to avoid circular dependency
