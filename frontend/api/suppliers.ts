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

  listAll: async (search?: string, skip?: number, limit?: number): Promise<SupplierOut[]> => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (skip !== undefined) params.append('skip', skip.toString());
    if (limit !== undefined) params.append('limit', limit.toString());
    
    const response = await apiClient.get<SupplierOut[]>(`/suppliers?${params.toString()}`);
    return response.data;
  },
};
