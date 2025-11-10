from enum import Enum

class Role(Enum):
    CONSUMER = "consumer"
    SUPPLIER_OWNER = "supplier_owner"
    SUPPLIER_MANAGER = "supplier_manager"
    SUPPLIER_SALES = "supplier_sales"
