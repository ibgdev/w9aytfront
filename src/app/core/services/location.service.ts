// src/app/services/location.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LocationService {
  // In dev (running on localhost:4200) call backend directly to avoid the dev server returning
  // index.html for `/api/*` routes which causes HttpClient parsing errors.
  private baseUrl = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
    ? 'http://localhost:3200/api/location'
    : '/api/location'; // production: use relative path

  constructor(private http: HttpClient) {}

  reverseGeocode(lat: number, lon: number): Observable<any> {
    const params = new HttpParams().set('lat', String(lat)).set('lon', String(lon));
    return this.http.get<any>(`${this.baseUrl}/reverse`, { params });
  }

  forwardGeocode(query: string): Observable<any> {
    const params = new HttpParams().set('q', query).set('lang', 'fr');
    return this.http.get<any>(`${this.baseUrl}/search`, { params });
  }
}
