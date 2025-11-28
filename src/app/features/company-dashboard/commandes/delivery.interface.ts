export interface Delivery {
  id?: number;
  client_id: number;
  company_id: number;
  driver_id?: number;
  pickup_address: string;
  dropoff_address: string;
  receiver_name: string;
  receiver_phone: string;
  weight: number;
  size: 'S' | 'M' | 'L';
  price: number;
  currency: string;
  payment_method: string;
  payment_amount: number;
  status: 'pending' | 'accepted' | 'in_transit' | 'delivered' | 'cancelled' | 'returned';
  completed_at?: string;
  created_at?: string;
  client?: any;
  driver?: any;
}