from enum import Enum

class LinkStatus(Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    BLOCKED = "blocked"
    REMOVED = "removed"
