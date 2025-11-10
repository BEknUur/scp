import { LinkStatus } from '@/enums';

export interface Link {
  id: number;
  consumer_id: number;
  supplier_id: number;
  status: LinkStatus;
}

export interface LinkOut {
  id: number;
  consumer_id: number;
  supplier_id: number;
  status: LinkStatus;
}
