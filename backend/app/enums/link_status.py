from enum import Enum

class LinkStatus(Enum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    BLOCKED = "BLOCKED"
    REMOVED = "REMOVED"
