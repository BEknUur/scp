import apiClient from './client';
import { Staff, StaffCreate, StaffUpdate } from '@/types';

export const staffApi = {
  // Create new staff member (Owner only)
  create: async (data: StaffCreate): Promise<Staff> => {
    const response = await apiClient.post<Staff>('/staff', data);
    return response.data;
  },

  // List all staff for current supplier
  list: async (): Promise<Staff[]> => {
    const response = await apiClient.get<Staff[]>('/staff');
    return response.data;
  },

  // Update staff member role (Owner only)
  update: async (staffId: number, data: StaffUpdate): Promise<Staff> => {
    const response = await apiClient.patch<Staff>(`/staff/${staffId}`, data);
    return response.data;
  },

  // Delete staff member (Owner only)
  delete: async (staffId: number): Promise<void> => {
    await apiClient.delete(`/staff/${staffId}`);
  },
};
