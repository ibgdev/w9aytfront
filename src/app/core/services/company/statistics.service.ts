import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../auth.service';

export interface MonthlyData {
  month: string;
  total: number;
  delivered: number;
}

export interface StatusDistribution {
  status: string;
  count: number;
}

export interface Statistics {
  commandesTotales: number;
  commandesLivrees: number;
  commandesAnnulees: number;
  livreursActifs: number;
  percentageChangeTotales: string;
  percentageChangeLivrees: string;
  percentageChangeAnnulees: string;
  percentageChangeLivreurs: string;
  monthlyData: MonthlyData[];
  statusDistribution: StatusDistribution[];
}

export interface Performance {
  livraisonsMoyennes: string;
  tempsMoyen: string;
  tauxSatisfaction: string;
  revenusTotaux: string;
  zonesActives: string;
}

export interface StatisticsResponse {
  success: boolean;
  statistics?: Statistics;
  performance?: Performance;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly API_URL = 'http://localhost:3200/api/company/statistics';

  private getHttpOptions(): { headers: HttpHeaders } {
    const token = this.authService.getToken();
    const headers: any = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return { headers: new HttpHeaders(headers) };
  }

  getStatistics(): Observable<StatisticsResponse> {
    return this.http.get<StatisticsResponse>(this.API_URL, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  getPerformanceData(): Observable<StatisticsResponse> {
    return this.http.get<StatisticsResponse>(`${this.API_URL}/performance`, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any): Observable<never> {
    console.error('Erreur StatisticsService:', error);
    const errorMessage = error.error?.error || error.error?.message || 'Une erreur est survenue';
    return throwError(() => ({ error: errorMessage, fullError: error }));
  }
}
