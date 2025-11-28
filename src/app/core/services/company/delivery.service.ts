import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../auth.service';

export interface Delivery {
  id: string;
  client: string;
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  adresse_livraison: string;
  dropoff_address?: string;
  pickup_address?: string;
  receiver_name?: string;
  receiver_phone: string;
  statut: 'pending' | 'accepted' | 'in_transit' | 'delivered' | 'cancelled' | 'returned';
  status?: 'pending' | 'accepted' | 'in_transit' | 'delivered' | 'cancelled' | 'returned';
  livreur_assigne: string;
  driver_id?: number;
  driver_name?: string;
  price: number;
  weight?: number;
  size?: string;
  payment_method?: string;
  payment_amount?: number;
  currency?: string;
  created_at?: string;
  completed_at?: string;
}

export interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
}

export interface Driver {
  id: number;
  name: string;
  phone: string;
  status: string;
}

export interface DeliveryResponse {
  success: boolean;
  deliveries?: Delivery[];
  delivery?: any;
  message?: string;
}

export interface ClientsResponse {
  success: boolean;
  clients?: Client[];
}

export interface DriversResponse {
  success: boolean;
  drivers?: Driver[];
}

export interface AddDeliveryRequest {
  client_id: number;
  driver_id?: number;
  pickup_address: string;
  dropoff_address: string;
  receiver_name: string;
  receiver_phone: string;
  weight: number;
  size: 'S' | 'M' | 'L';
  price: number;
  payment_method: string;
  payment_amount: number;
}

@Injectable({
  providedIn: 'root'
})
export class DeliveryService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly API_URL = 'http://localhost:3200/api/company/deliveries';

  private getHttpOptions(): { headers: HttpHeaders } {
    const token = this.authService.getToken();
    const headers: any = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return { headers: new HttpHeaders(headers) };
  }

  getAllDeliveries(): Observable<DeliveryResponse> {
    return this.http.get<DeliveryResponse>(this.API_URL, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  getDeliveryById(id: number): Observable<DeliveryResponse> {
    return this.http.get<DeliveryResponse>(`${this.API_URL}/${id}`, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  getClients(): Observable<ClientsResponse> {
    return this.http.get<ClientsResponse>(`${this.API_URL}/clients`, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  getDrivers(): Observable<DriversResponse> {
    return this.http.get<DriversResponse>(`${this.API_URL}/drivers`, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  createDelivery(delivery: AddDeliveryRequest): Observable<any> {
    return this.http.post(this.API_URL, delivery, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  updateDelivery(id: number, delivery: any): Observable<any> {
    return this.http.put(`${this.API_URL}/${id}`, delivery, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  deleteDelivery(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any): Observable<never> {
    console.error('Erreur DeliveryService:', error);
    const errorMessage = error.error?.error || error.error?.message || 'Une erreur est survenue';
    return throwError(() => ({ error: errorMessage, fullError: error }));
  }
}
