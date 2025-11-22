import apiClient from './client';
import { ProductOut, ProductCreate, ProductUpdate } from '@/types';

export const productsApi = {
  create: async (data: ProductCreate): Promise<ProductOut> => {
    const response = await apiClient.post<ProductOut>('/products', data);
    return response.data;
  },

  update: async (productId: number, data: ProductUpdate): Promise<ProductOut> => {
    const response = await apiClient.put<ProductOut>(`/products/${productId}`, data);
    return response.data;
  },

  delete: async (productId: number): Promise<void> => {
    await apiClient.delete(`/products/${productId}`);
  },

  listMyProducts: async (): Promise<ProductOut[]> => {
    const response = await apiClient.get<ProductOut[]>('/products/mine');
    return response.data;
  },

  listForSupplier: async (supplierId: number): Promise<ProductOut[]> => {
    const response = await apiClient.get<ProductOut[]>('/products', {
      params: { supplier_id: supplierId },
    });
    return response.data;
  },

  listBySupplier: async (supplierId: number): Promise<ProductOut[]> => {
    const response = await apiClient.get<ProductOut[]>('/products', {
      params: { supplier_id: supplierId },
    });
    return response.data;
  },
};
