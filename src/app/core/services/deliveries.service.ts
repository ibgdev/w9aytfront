import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Delivery {
  id: number;
  client_id: number;
  driver_id?: number;
  company_id: number;
  pickup_address: string;
  dropoff_address: string;
  package_weight?: number;
  weight?: number;
  package_size?: string;
  size?: string;
  price: number;
  payment_amount?: number;
  payment_method: string;
  status: string;
  currency: string;
  created_at?: string;
  updated_at?: string;
  completed_at?: string;
  client_name?: string;
  company_name?: string;
  receiver_name?: string;
  receiver_phone?: string;
}

export interface DeliveryResponse {
  data: Delivery[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class DeliveriesService {
  // Always use production API host
  private baseUrl = 'https://w9aytdelivery.onrender.com/api/deliveries';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token || ''}`,
      'Content-Type': 'application/json'
    });
  }

  getDriverDeliveries(status?: string, page: number = 1, limit: number = 1000): Observable<DeliveryResponse> {
    let url = `${this.baseUrl}/driver?page=${page}&limit=${limit}`;
    if (status && status !== 'all') {
      url += `&status=${status}`;
    }
    return this.http.get<DeliveryResponse>(url, { headers: this.getAuthHeaders() });
  }

  markAsDelivered(deliveryId: number): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/${deliveryId}/delivered`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * Mark a delivery as "in transit".
   * Backend route mirrors other actions (e.g. /delivered, /returned).
   */
  markAsInTransit(deliveryId: number): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/${deliveryId}/in_transit`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }

  markAsReturned(deliveryId: number): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/${deliveryId}/returned`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }
}

