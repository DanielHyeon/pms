"""Import SQLAlchemy models so Alembic can autogenerate migrations."""

from app.db.session import Base  # noqa: F401

# Models would be imported here in the future, e.g.:
# from app.db.models.user import User  # noqa
