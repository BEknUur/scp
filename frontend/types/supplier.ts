export interface Supplier {
  id: number;
  name: string;
  description?: string;
  owner_id: number;
}

export interface SupplierCreate {
  name: string;
  description?: string;
}

export interface SupplierOut {
  id: number;
  name: string;
  description?: string;
}
