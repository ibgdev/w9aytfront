import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Company {
  id?: number;
  user_id?: number;
  name: string;
  legal_status: string;
  tax_id: string;
  phone: string;
  email: string;
  address: string;
  password?: string;
  logo_url?: string;
  createdAt?: Date;
}

export interface RegisterResponse {
  message: string;
  user_id: number;
  company_id: number;
}

export interface CompaniesResponse {
  companies: Company[];
}

export interface CompanyResponse {
  company: Company | Company[];
}

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private http = inject(HttpClient);
  private apiUrl = 'https://w9aytdelivery.onrender.com/company';

  registerCompany(company: Company, logoFile?: File | null): Observable<RegisterResponse> {
  const formData = new FormData();

  formData.append('name', company.name);
  formData.append('legal_status', company.legal_status);
  formData.append('tax_id', company.tax_id);
  formData.append('phone', company.phone);
  formData.append('email', company.email);
  formData.append('address', company.address);
  formData.append('password', company.password || '');

  if (logoFile) {
    formData.append('logo', logoFile); // ⚠️ 'logo' doit correspondre au nom du champ dans ton backend
  }

  return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, formData);
}


  getAllCompanies(): Observable<Company[]> {
    return this.http.get<CompaniesResponse>(`${this.apiUrl}/all`)
      .pipe(map(response => response.companies));
  }

  getCompanyById(id: number): Observable<Company> {
    return this.http.get<CompanyResponse>(`${this.apiUrl}/getid/${id}`)
      .pipe(map(response => Array.isArray(response.company) ? response.company[0] : response.company));
  }

  getCompanyByUserId(userId: number): Observable<Company> {
    return this.http.get<CompanyResponse>(`${this.apiUrl}/getbyuserid/${userId}`)
      .pipe(map(response => Array.isArray(response.company) ? response.company[0] : response.company));
  }

  getCompaniesByName(name: string): Observable<Company[]> {
    return this.http.get<{ companies: Company[] }>(`${this.apiUrl}/getbyname/${name}`)
      .pipe(map(response => response.companies));
  }

  updateCompany(id: number, company: Company): Observable<any> {
    const data = {
      user_id: company.user_id,
      name: company.name,
      legal_status: company.legal_status,
      tax_id: company.tax_id,
      logo_url: company.logo_url || ''
    };
    return this.http.put(`${this.apiUrl}/update/${id}`, data);
  }

  deleteCompany(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${id}`);
  }

  saveToken(token: string): void {
    localStorage.setItem('company_token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('company_token');
  }

  removeToken(): void {
    localStorage.removeItem('company_token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  saveUserInfo(userId: number, companyId: number): void {
    localStorage.setItem('user_id', userId.toString());
    localStorage.setItem('company_id', companyId.toString());
  }

  getUserId(): number | null {
    const userId = localStorage.getItem('user_id');
    return userId ? parseInt(userId) : null;
  }

  getCompanyId(): number | null {
    const companyId = localStorage.getItem('company_id');
    return companyId ? parseInt(companyId) : null;
  }

  logout(): void {
    this.removeToken();
    localStorage.removeItem('user_id');
    localStorage.removeItem('company_id');
  }
}