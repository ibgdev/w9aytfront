import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Company {
  id?: number;
  user_id?: number;
  name: string;
  logo_url?: string;
  tax_id?: string;
  legal_status?: string;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private apiUrl = 'http://localhost:3200/company';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  // Récupérer toutes les companies
  getAllCompanies(): Observable<Company[]> {
    return this.http.get<Company[]>(`${this.apiUrl}/all`);
  }

  // Récupérer une company par ID
  getCompanyById(id: number): Observable<Company> {
    return this.http.get<Company>(`${this.apiUrl}/${id}`);
  }

  // Créer une nouvelle company (avec upload de logo)
  createCompany(formData: FormData): Observable<any> {
    // Ne pas définir Content-Type pour FormData, le navigateur le fait automatiquement
    return this.http.post(`${this.apiUrl}/register`, formData);
  }

  // Mettre à jour une company
  updateCompany(id: number, company: Partial<Company>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, company, {
      headers: this.getHeaders()
    });
  }

  // Supprimer une company
  deleteCompany(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}