import { ComplaintStatus } from '@/enums';

export interface Complaint {
  id: number;
  link_id?: number;
  order_id?: number;
  description: string;
  status: ComplaintStatus;
  created_by: number;
  created_at: string;
}

export interface ComplaintCreate {
  link_id?: number;
  order_id?: number;
  description: string;
}

export interface ComplaintStatusUpdate {
  status: ComplaintStatus;
}

export interface ComplaintOut {
  id: number;
  link_id?: number;
  order_id?: number;
  description: string;
  status: ComplaintStatus;
  created_by: number;
  created_at: string;
}
