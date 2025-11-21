import { User } from './user';

export interface Supplier {
  id: number;
  name: string;
  description?: string;
  owner_id: number;
  owner?: User;
}

export interface SupplierCreate {
  name: string;
  description?: string;
}

export interface SupplierOut {
  id: number;
  name: string;
  description?: string;
  owner_id: number;
  owner?: User;
}
