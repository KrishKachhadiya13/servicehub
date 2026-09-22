import enum

class UserRoleEnum(str, enum.Enum):
    EMPLOYEE = "EMPLOYEE"
    SUPPORT_AGENT = "SUPPORT_AGENT"
    MANAGER = "MANAGER"
    ADMIN = "ADMIN"

class TicketPriorityEnum(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class TicketStatusEnum(str, enum.Enum):
    OPEN = "OPEN"
    ASSIGNED = "ASSIGNED"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"
    REOPENED = "REOPENED"

class SLAStatusEnum(str, enum.Enum):
    SAFE = "SAFE"
    AT_RISK = "AT_RISK"
    BREACHED = "BREACHED"
