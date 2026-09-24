from fastapi import APIRouter
from app.api.v1 import health, auth, users, tickets, departments, categories, notifications, audit, sla

api_router = APIRouter()
api_router.include_router(health.router, tags=["Health Check"])
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(tickets.router, prefix="/tickets", tags=["Tickets"])
api_router.include_router(departments.router, prefix="/departments", tags=["Departments"])
api_router.include_router(categories.router, prefix="/categories", tags=["Categories"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(audit.router, prefix="/audit", tags=["Audit"])
api_router.include_router(sla.router, prefix="/sla", tags=["SLA"])
