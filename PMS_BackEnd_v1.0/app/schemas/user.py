from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    id: str
    email: EmailStr
    name: str
    role: str
    department: Optional[str] = None
    projects: Optional[List[str]] = None
    is_active: bool = True


class User(UserBase):
    class Config:
        orm_mode = True


class UserPublic(UserBase):
    pass


class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str
    role: str = "user"
    department: Optional[str] = None


class UserUpdate(BaseModel):
    name: Optional[str] = None
    department: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
