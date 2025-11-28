export interface Driver {
  id?: number;
  user_id: number;
  company_id: number;
  status: 'available' | 'busy' | 'suspended' | 'offline';
  created_at?: string;
  user?: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
}