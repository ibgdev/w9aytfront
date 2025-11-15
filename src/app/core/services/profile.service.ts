import { inject, Injectable } from '@angular/core';
import { User } from './auth.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';

export interface UpdateProfileRequest {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  user?: User;
}
export interface VerifyPasswordRequest {
  email: string;
  curentPassword: string;
}
export interface VerifyPasswordResponse {
  success: boolean;
  message: string;
}

export interface DeleteAccountRequest {
  UserId: number;
  email: string;
  password: string;
}

export interface DeleteAccountResponse {
  success: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:3200/api/profile';

  updateProfile(data: UpdateProfileRequest): Observable<UpdateProfileResponse> {
    return this.http
      .put<UpdateProfileResponse>(`${this.API_URL}/update`, data)
      .pipe(catchError(this.handleError));
  }

  verifyPassword(data: VerifyPasswordRequest): Observable<VerifyPasswordResponse> {
    return this.http
      .post<VerifyPasswordResponse>(`${this.API_URL}/verify-password`, data)
      .pipe(catchError(this.handleError));
  }

  deleteAccount(data: DeleteAccountRequest): Observable<DeleteAccountResponse> {
  return this.http
    .post<DeleteAccountResponse>(`${this.API_URL}/delete-account`, data)
    .pipe(catchError(this.handleError));
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
