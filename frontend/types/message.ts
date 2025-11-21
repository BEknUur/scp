import { User } from './user';

export interface Message {
  id: number;
  link_id: number;
  sender_id: number;
  text?: string;
  file_url?: string;
  audio_url?: string;
  created_at: string;
  sender?: User;
}

export interface MessageCreate {
  text?: string;
  file_url?: string;
  audio_url?: string;
}

export interface MessageOut {
  id: number;
  link_id: number;
  sender_id: number;
  text?: string;
  file_url?: string;
  audio_url?: string;
  created_at: string;
  sender?: User;
}
