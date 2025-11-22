import { Role } from '@/enums';

export interface Staff {
  id: number;
  user_id: number;
  supplier_id: number;
  role: Role;
  invited_by: number;
  created_at: string;
  user: {
    id: number;
    email: string;
    name?: string;
  };
  inviter: {
    id: number;
    email: string;
    name?: string;
  };
}

export interface StaffCreate {
  email: string;
  password: string;
  role: Role.SUPPLIER_MANAGER | Role.SUPPLIER_SALES;
}

export interface StaffUpdate {
  role: Role.SUPPLIER_MANAGER | Role.SUPPLIER_SALES;
}
