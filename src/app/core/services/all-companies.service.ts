import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface PublicCompany {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  logo_url: string | null;
  status: string;
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
  private apiUrl = 'http://localhost:3200/api/allCompanies';

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
}
