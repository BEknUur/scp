import { apiClient } from './client';
import { Order, OrderCreate } from '@/types';

export const ordersApi = {
  create: async (data: OrderCreate): Promise<Order> => {
    const response = await apiClient.post('/orders', data);
    return response.data;
  },

  getMyOrders: async (): Promise<Order[]> => {
    const response = await apiClient.get('/orders/me');
    return response.data;
  },

  accept: async (orderId: number): Promise<Order> => {
    const response = await apiClient.post(`/orders/${orderId}/accept`);
    return response.data;
  },

  reject: async (orderId: number): Promise<Order> => {
    const response = await apiClient.post(`/orders/${orderId}/reject`);
    return response.data;
  },
};

