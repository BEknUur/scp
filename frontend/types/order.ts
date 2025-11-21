import { User } from './user';
import { Supplier } from './supplier';
import { Product } from './product';

export enum OrderStatus {
  CREATED = 'CREATED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  product?: Product;
}

export interface Order {
  id: number;
  supplier_id: number;
  consumer_id: number;
  total_amount: number;
  status: OrderStatus;
  created_at: string;
  supplier?: Supplier;
  consumer?: User;
  items: OrderItem[];
}

export interface OrderItemCreate {
  product_id: number;
  quantity: number;
}

export interface OrderCreate {
  supplier_id: number;
  items: OrderItemCreate[];
}

