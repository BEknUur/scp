export interface Product {
  id: number;
  supplier_id: number;
  name: string;
  unit: string;
  price: number;
  stock: number;
  moq: number;
  is_active: boolean;
}

export interface ProductCreate {
  name: string;
  unit: string;
  price: number;
  stock?: number;
  moq?: number;
}

export interface ProductUpdate {
  name?: string;
  unit?: string;
  price?: number;
  stock?: number;
  moq?: number;
  is_active?: boolean;
}

export interface ProductOut {
  id: number;
  supplier_id: number;
  name: string;
  unit: string;
  price: number;
  stock: number;
  moq: number;
  is_active: boolean;
}
