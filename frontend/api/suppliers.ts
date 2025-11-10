import apiClient from './client';
import { SupplierOut, SupplierCreate } from '@/types';

export const suppliersApi = {
  create: async (data: SupplierCreate): Promise<SupplierOut> => {
    const response = await apiClient.post<SupplierOut>('/suppliers', data);
    return response.data;
  },

  getMySupplier: async (): Promise<SupplierOut> => {
    const response = await apiClient.get<SupplierOut>('/suppliers/me');
    return response.data;
  },
};
