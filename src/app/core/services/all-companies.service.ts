import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface PublicCompany {
  id: number;
  user_id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  logo_url: string | null;
  status: string;
  tax_id?: string;
  legal_status?: string;
  created_at?: string;
  imageError?: boolean;
}

export interface AllCompaniesResponse {
  success: boolean;
  data: PublicCompany[];
}

export interface SingleCompanyResponse {
  success: boolean;
  data: PublicCompany;
}

@Injectable({
  providedIn: 'root'
})
export class AllCompaniesService {
  private http = inject(HttpClient);
  private apiUrl = 'https://w9aytdelivery.onrender.com/api/allCompanies';

  getAllCompanies(): Observable<PublicCompany[]> {
    return this.http.get<AllCompaniesResponse>(this.apiUrl).pipe(
      map(response => response.data)
    );
  }

  getCompanyById(id: number): Observable<PublicCompany> {
    return this.http.get<SingleCompanyResponse>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.data)
    );
  }

  getCompanyByUserId(user_id: number): Observable<PublicCompany> {
    return this.http.get<SingleCompanyResponse>(`${this.apiUrl}/by-user/${user_id}`).pipe(
      map(response => response.data)
    );
  }
}
