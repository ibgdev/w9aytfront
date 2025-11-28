import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../auth.service';

export interface Driver {
  id: number;
  patronim: string;
  phone_number: string;
  email: string;
  status: 'available' | 'busy' | 'suspended' | 'offline';
  livraisons_effectuees: number;
  zone_couverture: string;
  created_at?: string;
}

export interface AddDriverRequest {
  patronim: string;
  telephone: string;
  email: string;
  motDePasse: string;
  zoneCouverture: string;
}

export interface DriverResponse {
  success: boolean;
  drivers?: Driver[];
  driver?: any;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DriverService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly API_URL = 'http://localhost:3200/api/company/drivers';

  private getHttpOptions(): { headers: HttpHeaders } {
    const token = this.authService.getToken();
    const headers: any = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return { headers: new HttpHeaders(headers) };
  }

  getAllDrivers(): Observable<DriverResponse> {
    return this.http.get<DriverResponse>(this.API_URL, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  getDriverById(id: number): Observable<DriverResponse> {
    return this.http.get<DriverResponse>(`${this.API_URL}/${id}`, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  addDriver(driver: AddDriverRequest): Observable<any> {
    return this.http.post(this.API_URL, driver, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  updateDriver(id: number, driver: any): Observable<any> {
    return this.http.put(`${this.API_URL}/${id}`, driver, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  deleteDriver(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any): Observable<never> {
    console.error('Erreur DriverService:', error);
    const errorMessage = error.error?.error || error.error?.message || 'Une erreur est survenue';
    return throwError(() => ({ error: errorMessage, fullError: error }));
  }
}
