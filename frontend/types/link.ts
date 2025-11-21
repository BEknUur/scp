import { LinkStatus } from '@/enums';
import { User } from './user';
import { Supplier } from './supplier';

export interface Link {
  id: number;
  consumer_id: number;
  supplier_id: number;
  status: LinkStatus;
  supplier?: Supplier;
  consumer?: User;
}

export interface LinkOut {
  id: number;
  consumer_id: number;
  supplier_id: number;
  status: LinkStatus;
  supplier?: Supplier;
  consumer?: User;
}
