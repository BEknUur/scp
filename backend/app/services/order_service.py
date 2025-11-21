from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.repositories.order_repo import OrderRepo
from app.repositories.link_repo import LinkRepo
from app.repositories.product_repo import ProductRepo
from app.repositories.supplier_repo import SupplierRepo
from app.repositories.staff_repo import StaffRepo
from app.models.user import User
from app.models.order import Order
from app.enums import Role, LinkStatus, OrderStatus
from app.schemas.order import OrderCreate


class OrderService:
    @staticmethod
    def create_order(db: Session, consumer: User, data: OrderCreate) -> Order:
        """Consumer creates order"""
        # 1. Check role
        if consumer.role != Role.CONSUMER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only consumers can create orders"
            )
        
        # 2. Check link exists and is ACCEPTED
        link = LinkRepo.get_by_pair(db, consumer_id=consumer.id, supplier_id=data.supplier_id)
        if not link:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No link with this supplier"
            )
        if link.status != LinkStatus.ACCEPTED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Link status is {link.status.value}, must be ACCEPTED to create orders"
            )
        
        # 3. Validate products and calculate total
        if not data.items:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Order must have at least one item"
            )
        
        product_ids = [item.product_id for item in data.items]
        products = ProductRepo.get_by_ids(db, product_ids)
        
        if len(products) != len(product_ids):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="One or more products not found"
            )
        
        # Verify all products belong to the supplier
        for product in products:
            if product.supplier_id != data.supplier_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Product {product.id} does not belong to supplier {data.supplier_id}"
                )
            if not product.is_active:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Product {product.name} is not active"
                )
        
        # Calculate total and prepare items data
        products_map = {p.id: p for p in products}
        items_data = []
        total_amount = 0.0
        
        for item in data.items:
            product = products_map[item.product_id]
            
            # Check MOQ
            if item.quantity < product.moq:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Product {product.name} requires minimum order quantity of {product.moq}"
                )
            
            # Check stock
            if item.quantity > product.stock:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Product {product.name} has only {product.stock} units in stock"
                )
            
            unit_price = float(product.price)
            total_amount += unit_price * item.quantity
            
            items_data.append({
                'product_id': item.product_id,
                'quantity': item.quantity,
                'unit_price': unit_price
            })
        
        # 4. Create order
        order = OrderRepo.create(
            db=db,
            consumer_id=consumer.id,
            supplier_id=data.supplier_id,
            total_amount=total_amount,
            items_data=items_data
        )
        
        return order

    @staticmethod
    def list_my_orders(db: Session, user: User, status_filter: Optional[OrderStatus] = None) -> List[Order]:
        """Get orders for current user with optional status filter"""
        if user.role == Role.CONSUMER:
            return OrderRepo.list_for_consumer(db, consumer_id=user.id, status=status_filter)
        elif user.role in [Role.SUPPLIER_OWNER, Role.SUPPLIER_MANAGER, Role.SUPPLIER_SALES]:
            # Get supplier for this user (Owner or Staff)
            supplier_id = StaffRepo.get_supplier_for_user(db, user.id)
            if not supplier_id:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Supplier not found for this user"
                )
            return OrderRepo.list_for_supplier(db, supplier_id=supplier_id, status=status_filter)
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid role for orders"
            )

    @staticmethod
    def get_order_detail(db: Session, user: User, order_id: int) -> Order:
        """Get detailed order information"""
        order = OrderRepo.get_by_id(db, order_id)
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )

        # Authorization check
        if user.role == Role.CONSUMER:
            # Consumer can only view their own orders
            if order.consumer_id != user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You can only view your own orders"
                )
        elif user.role in [Role.SUPPLIER_OWNER, Role.SUPPLIER_MANAGER, Role.SUPPLIER_SALES]:
            # Supplier staff can view orders to their company
            supplier_id = StaffRepo.get_supplier_for_user(db, user.id)
            if not supplier_id or order.supplier_id != supplier_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You can only view orders to your supplier"
                )
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid role"
            )

        return order

    @staticmethod
    def accept_order(db: Session, user: User, order_id: int) -> Order:
        """Supplier Owner/Manager accepts order"""
        if user.role not in [Role.SUPPLIER_OWNER, Role.SUPPLIER_MANAGER]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only supplier owners or managers can accept orders"
            )
        
        order = OrderRepo.get_by_id(db, order_id)
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        
        # Verify order belongs to user's supplier
        supplier_id = StaffRepo.get_supplier_for_user(db, user.id)
        if not supplier_id or order.supplier_id != supplier_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This order does not belong to your supplier"
            )
        
        if order.status != OrderStatus.CREATED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot accept order with status {order.status.value}"
            )
        
        return OrderRepo.update_status(db, order, OrderStatus.ACCEPTED)

    @staticmethod
    def reject_order(db: Session, user: User, order_id: int) -> Order:
        """Supplier Owner/Manager rejects order"""
        if user.role not in [Role.SUPPLIER_OWNER, Role.SUPPLIER_MANAGER]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only supplier owners or managers can reject orders"
            )
        
        order = OrderRepo.get_by_id(db, order_id)
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        
        # Verify order belongs to user's supplier
        supplier_id = StaffRepo.get_supplier_for_user(db, user.id)
        if not supplier_id or order.supplier_id != supplier_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This order does not belong to your supplier"
            )
        
        if order.status != OrderStatus.CREATED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot reject order with status {order.status.value}"
            )
        
        return OrderRepo.update_status(db, order, OrderStatus.REJECTED)

