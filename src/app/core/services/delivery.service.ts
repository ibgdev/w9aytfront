import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DeliveryService {
  private baseUrl = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
    ? 'http://localhost:3200/api/delivery'
    : '/api/delivery';

  constructor(private http: HttpClient) {}

  createDelivery(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}`, data);
  }

  getDeliveries(params?: any): Observable<any> {
    // params peut contenir page, search, etc.
    return this.http.get<any>(`${this.baseUrl}`, { params });
  }

  getDeliveryHistory(params?: any): Observable<any> {
  // params can include q, status, startDate, endDate, page, pageSize, etc.
  return this.http.get<any>(`${this.baseUrl}/history`, { params });
  }

  cancelDelivery(id: number | string): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/${id}/cancel`, {});
  }
}
