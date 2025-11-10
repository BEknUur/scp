import apiClient from './client';
import { ComplaintOut, ComplaintCreate, ComplaintStatusUpdate } from '@/types';
import { ComplaintStatus } from '@/enums';

export const complaintsApi = {
  create: async (data: ComplaintCreate): Promise<ComplaintOut> => {
    const response = await apiClient.post<ComplaintOut>('/complaints', data);
    return response.data;
  },

  updateStatus: async (
    complaintId: number,
    data: ComplaintStatusUpdate
  ): Promise<ComplaintOut> => {
    const response = await apiClient.patch<ComplaintOut>(
      `/complaints/${complaintId}/status`,
      data
    );
    return response.data;
  },

  list: async (
    status?: ComplaintStatus,
    mine: boolean = false,
    limit: number = 50,
    offset: number = 0
  ): Promise<ComplaintOut[]> => {
    const response = await apiClient.get<ComplaintOut[]>('/complaints', {
      params: { status, mine, limit, offset },
    });
    return response.data;
  },
};
