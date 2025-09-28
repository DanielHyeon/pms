from typing import Generic, List, Sequence, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    limit: int
    offset: int


def paginate(items: Sequence[T], limit: int = 50, offset: int = 0) -> PaginatedResponse[T]:
    sliced = list(items)[offset : offset + limit]
    return PaginatedResponse(items=sliced, total=len(items), limit=limit, offset=offset)
