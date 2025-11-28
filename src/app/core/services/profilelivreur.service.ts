import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class ProfileLivreurService {
  private baseUrl = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
    ? 'https://w9aytdelivery.onrender.com/api/profilelivreur'
    : 'https://w9aytdelivery.onrender.com/api/profilelivreur';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token || ''}`,
      'Content-Type': 'application/json'
    });
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/livreur`, { headers: this.getAuthHeaders() });
  }

  updateProfile(user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/livreur`, user, { headers: this.getAuthHeaders() });
  }

  deleteAccount(): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/livreur`, { headers: this.getAuthHeaders() });
  }
}

