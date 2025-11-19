import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CompanyService {
  private baseUrl = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
    ? 'http://localhost:3200/company/all'
    : '/company/all';

  constructor(private http: HttpClient) {}

  getAllCompanies(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }
}
