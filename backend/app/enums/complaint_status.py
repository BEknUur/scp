from enum import Enum

class ComplaintStatus(Enum):
    OPEN = "OPEN"
    IN_PROGRESS = "IN_PROGRESS"
    ESCALATED = "ESCALATED"
    RESOLVED = "RESOLVED"
