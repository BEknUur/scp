import apiClient from './client';
import { MessageOut, MessageCreate } from '@/types';

export const chatApi = {
  sendMessage: async (linkId: number, data: MessageCreate): Promise<MessageOut> => {
    const response = await apiClient.post<MessageOut>(`/chat/${linkId}/messages`, data);
    return response.data;
  },

  listMessages: async (
    linkId: number,
    limit: number = 50,
    offset: number = 0
  ): Promise<MessageOut[]> => {
    const response = await apiClient.get<MessageOut[]>(`/chat/${linkId}/messages`, {
      params: { limit, offset },
    });
    return response.data;
  },
};
