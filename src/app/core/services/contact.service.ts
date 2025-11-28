import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ContactFormData {
  fullname: string;
  email: string;
  tell: string;
}

export interface Contact {
  id?: number;
  fullname: string;
  email: string;
  tell: string;
  created_at?: string;
}

export interface ContactResponse {
  success: boolean;
  message?: string;
  data?: Contact[];
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private apiUrl = 'https://w9aytdelivery.onrender.com/api/contact';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  sendContact(data: ContactFormData): Observable<ContactResponse> {
    return this.http.post<ContactResponse>(this.apiUrl, data, { headers: this.getHeaders() });
  }

  getAllContacts(): Observable<ContactResponse> {
    return this.http.get<ContactResponse>(this.apiUrl, { headers: this.getHeaders() });
  }

  deleteContact(id: number): Observable<ContactResponse> {
    return this.http.delete<ContactResponse>(`${this.apiUrl}/delete`, {
      headers: this.getHeaders(),
      body: { id }
    });
  }
}
