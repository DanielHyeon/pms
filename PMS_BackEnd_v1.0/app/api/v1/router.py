from fastapi import APIRouter

from app.api.v1.endpoints import (
    ai,
    auth,
    backlog,
    budgets,
    executive,
    health,
    integrations,
    notifications,
    projects,
    quality,
    requirements,
    risk,
    sprints,
    tasks,
)

api_router = APIRouter()
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(tasks.router, prefix="/projects", tags=["tasks"])
api_router.include_router(requirements.router, prefix="/projects", tags=["requirements"])
api_router.include_router(sprints.router, prefix="/projects", tags=["sprints"])
api_router.include_router(backlog.router, prefix="/projects", tags=["backlog"])
api_router.include_router(budgets.router, prefix="/budgets", tags=["budgets"])
api_router.include_router(executive.router, prefix="/executive", tags=["executive"])
api_router.include_router(risk.router, prefix="/projects", tags=["risk"])
api_router.include_router(quality.router, prefix="/projects", tags=["quality"])
api_router.include_router(notifications.router, prefix="/projects", tags=["notifications"])
api_router.include_router(integrations.router, prefix="/integrations", tags=["integrations"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
