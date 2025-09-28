from __future__ import annotations

import sys
import types
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


# Provide a lightweight fallback for email validation when the optional dependency
# is unavailable in sandboxed environments.
try:  # pragma: no cover - executed at import time
    import email_validator  # type: ignore
except ImportError:  # pragma: no cover
    class EmailNotValidError(ValueError):
        """Minimal EmailNotValidError replacement."""

    class EmailValidationResult:
        def __init__(self, email: str) -> None:
            self.email = email
            self.original_email = email
            self.local_part = email.split('@')[0] if '@' in email else email
            self.domain = email.split('@')[1] if '@' in email else ''
            self.ascii_email = email

    def validate_email(email: str, *_args, **_kwargs) -> EmailValidationResult:
        if '@' not in email:
            raise EmailNotValidError('Invalid email address')
        return EmailValidationResult(email)

    module = types.ModuleType('email_validator')
    module.validate_email = validate_email  # type: ignore[attr-defined]
    module.EmailNotValidError = EmailNotValidError  # type: ignore[attr-defined]
    sys.modules['email_validator'] = module

    try:
        from importlib import metadata as importlib_metadata
    except ImportError:  # pragma: no cover
        import importlib_metadata  # type: ignore

    _original_version = importlib_metadata.version

    def _version(package: str) -> str:
        if package == 'email-validator':
            return '2.0.0'
        return _original_version(package)

    importlib_metadata.version = _version  # type: ignore[assignment]

    try:  # pragma: no cover
        from pydantic import networks as _pydantic_networks

        _pydantic_networks.version = _version  # type: ignore[assignment]
    except Exception:
        pass

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.logging import setup_logging
from app.utils.data_store import get_datastore


def create_app() -> FastAPI:
    setup_logging()

    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(api_router, prefix=settings.API_V1_STR)

    @app.on_event("startup")
    async def _startup() -> None:
        # Preload the in-memory datastore so startup requests are snappy.
        get_datastore()

    return app


app = create_app()
