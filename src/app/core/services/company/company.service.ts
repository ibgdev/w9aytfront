import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../auth.service';

export interface CompanyStats {
  totalCommandes: number;
  deliveredCommandes: number;
  cancelledCommandes: number;
  activeDrivers: number;
  changeCommandes: number;
  changeDelivered: number;
  changeCancelled: number;
  changeDrivers: number;
}

export interface CompanyInfo {
  id: number;
  user_id: number;
  name: string;
  logo_url?: string;
  tax_id?: string;
  legal_status?: string;
  created_at?: string;
}

export interface CompanyProfile {
  id: number;
  user_id: number;
  name: string;
  tax_id?: string;
  legal_status?: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly API_URL = 'https://w9aytdelivery.onrender.com/api/company';

  private getHttpOptions(): { headers: HttpHeaders } {
    const token = this.authService.getToken();
    const headers: any = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return { headers: new HttpHeaders(headers) };
  }

  getCompanyInfo(companyId: number): Observable<CompanyInfo> {
    return this.http.get<CompanyInfo>(`${this.API_URL}/info?company_id=${companyId}`, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  getCompanyProfile(companyId: number): Observable<any> {
    return this.http.get(`${this.API_URL}/profile?company_id=${companyId}`, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  updateCompanyProfile(companyId: number, data: Partial<CompanyProfile>): Observable<any> {
    return this.http.put(`${this.API_URL}/profile?company_id=${companyId}`, data, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  getCompanyStats(companyId: number): Observable<CompanyStats> {
    return this.http.get<CompanyStats>(`${this.API_URL}/stats?company_id=${companyId}`)
      .pipe(catchError(this.handleError));
  }

  updateCompany(companyId: number, data: Partial<CompanyInfo>): Observable<any> {
    return this.http.put(`${this.API_URL}/${companyId}`, data)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any): Observable<never> {
    console.error('Erreur CompanyService:', error);
    return throwError(() => error.error?.message || 'Une erreur est survenue');
  }
}