from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.order import Order
from app.models.order_item import OrderItem
from app.enums import OrderStatus


class OrderRepo:
    @staticmethod
    def create(
        db: Session,
        consumer_id: int,
        supplier_id: int,
        total_amount: float,
        items_data: list[dict]
    ) -> Order:
        """Create order with items"""
        order = Order(
            consumer_id=consumer_id,
            supplier_id=supplier_id,
            total_amount=total_amount,
            status=OrderStatus.CREATED
        )
        db.add(order)
        db.flush()  # Get order.id
        
        # Create order items
        for item_data in items_data:
            order_item = OrderItem(
                order_id=order.id,
                product_id=item_data['product_id'],
                quantity=item_data['quantity'],
                unit_price=item_data['unit_price']
            )
            db.add(order_item)
        
        db.commit()
        db.refresh(order)
        return order

    @staticmethod
    def get_by_id(db: Session, order_id: int) -> Optional[Order]:
        """Get order by ID with relationships loaded"""
        stmt = select(Order).where(Order.id == order_id)
        return db.execute(stmt).unique().scalar_one_or_none()

    @staticmethod
    def list_for_consumer(db: Session, consumer_id: int, status: Optional[OrderStatus] = None) -> List[Order]:
        """List orders for consumer with optional status filter"""
        stmt = select(Order).where(Order.consumer_id == consumer_id)
        if status:
            stmt = stmt.where(Order.status == status)
        stmt = stmt.order_by(Order.created_at.desc())
        return db.execute(stmt).scalars().unique().all()

    @staticmethod
    def list_for_supplier(db: Session, supplier_id: int, status: Optional[OrderStatus] = None) -> List[Order]:
        """List orders for supplier with optional status filter"""
        stmt = select(Order).where(Order.supplier_id == supplier_id)
        if status:
            stmt = stmt.where(Order.status == status)
        stmt = stmt.order_by(Order.created_at.desc())
        return db.execute(stmt).scalars().unique().all()

    @staticmethod
    def update_status(db: Session, order: Order, status: OrderStatus) -> Order:
        """Update order status"""
        order.status = status
        db.add(order)
        db.commit()
        db.refresh(order)
        return order

