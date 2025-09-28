from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.config import settings
from app.core.security import (
    authenticate_user,
    create_access_token,
    get_current_active_user,
)
from app.schemas.auth import LoginRequest, LoginResponse, Token
from app.schemas.user import User
from app.utils.data_store import DataStore, get_datastore

router = APIRouter()


@router.post("/login", response_model=LoginResponse)
async def login(
    payload: LoginRequest,
    datastore: DataStore = Depends(get_datastore),
) -> LoginResponse:
    user = authenticate_user(datastore, payload.email, payload.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = Token(
        accessToken=create_access_token(user["id"], expires_delta=expires_delta),
        expiresIn=int(expires_delta.total_seconds()),
    )

    return LoginResponse(token=token, user=User(**user))


@router.get("/me", response_model=User)
async def read_current_user(
    current_user: dict = Depends(get_current_active_user),
) -> User:
    return User(**current_user)
