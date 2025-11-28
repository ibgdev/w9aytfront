export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  status: string;
  verified: number;
  companyId?: number | null;
  created_at?: string;
  createdAt?: string; // Support both naming conventions
}

