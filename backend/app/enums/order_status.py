from enum import Enum

class OrderStatus(Enum):
    CREATED = "created"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
