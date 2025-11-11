import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Interfaces
export interface SignUpRequest {
  name: string;
  email: string;
  phone: string;
  address: string;
  password: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  status: string;
  verified: number;
  created_at: string;
}

export interface SignUpResponse {
  success: boolean;
  message: string;
  user?: User;
  errors?: Array<{ field: string; message: string }>;
}

export interface ForgotPasswordResponse{
  message: string
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:3200/api/auth';

  signUp(data: SignUpRequest): Observable<SignUpResponse> {
    return this.http
      .post<SignUpResponse>(`${this.API_URL}/signup`, data)
      .pipe(catchError(this.handleError));
  }

  login(data: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.API_URL}/login`, data)
      .pipe(catchError(this.handleError));
  }

  forgotPassword(email: string): Observable<ForgotPasswordResponse>{
    return this.http
    .post<ForgotPasswordResponse>(`${this.API_URL}/forgot-password`, { email })
    .pipe(catchError(this.handleError));
  }

  saveSession(token: string, user: User): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUser(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  isLoggedIn(): boolean {
    if (typeof window === 'undefined') {
      // SSR context: localStorage is not available
      return false;
    }
    return !!localStorage.getItem('token');
  }

  

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      errorMessage = error.error?.message || `Server Error: ${error.status}`;
    }

    return throwError(() => error.error);
  }
}
