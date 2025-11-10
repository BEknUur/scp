import apiClient from './client';
import { LinkOut } from '@/types';

export const linksApi = {
  requestLink: async (supplierId: number): Promise<LinkOut> => {
    const response = await apiClient.post<LinkOut>(`/links/${supplierId}`);
    return response.data;
  },

  acceptLink: async (linkId: number): Promise<LinkOut> => {
    const response = await apiClient.post<LinkOut>(`/links/${linkId}/accept`);
    return response.data;
  },

  blockLink: async (linkId: number): Promise<LinkOut> => {
    const response = await apiClient.post<LinkOut>(`/links/${linkId}/block`);
    return response.data;
  },

  removeLink: async (linkId: number): Promise<LinkOut> => {
    const response = await apiClient.post<LinkOut>(`/links/${linkId}/remove`);
    return response.data;
  },

  listMyLinks: async (): Promise<LinkOut[]> => {
    const response = await apiClient.get<LinkOut[]>('/links');
    return response.data;
  },
};
