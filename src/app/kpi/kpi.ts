import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-kpi',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './kpi.html',
  styleUrls: ['./kpi.scss']
})
export class KpiComponent implements OnInit {
  @Input() totalDeliveries: number = 0;
  @Input() inTransit: number = 0;
  @Input() delivered: number = 0;
  loading: boolean = true;
  error: string | null = null;
  // Debug info for diagnostics
  lastResponse: any = null;
  // duration in milliseconds for last fetch
  lastDurationMs: number | null = null;
  // last request URL for debugging
  lastRequestUrl: string | null = null;

  private auth = inject(AuthService);
  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchStats();
  }

  fetchStats() {
    this.loading = true;
    this.error = null;

    // Build URL with query params to limit KPIs to the logged-in user
    const base = 'http://localhost:3200/api/kpi/deliveries';
    const currentUser = this.auth.getCurrentUser();

    // If no logged-in user, do NOT call the API (avoid returning global totals)
    if (!currentUser) {
      this.lastResponse = null;
      this.error = null;
      this.loading = false;
      return;
    }

    let url = base;
    const params: string[] = [];
    if (currentUser.role === 'client') {
      params.push(`clientId=${currentUser.id}`);
    } else if (currentUser.role === 'driver') {
      params.push(`driverId=${currentUser.id}`);
    } else if (currentUser.role === 'company') {
      // We don't have company id in the stored user object; pass userId+role so backend resolves company
      params.push(`userId=${currentUser.id}`);
      params.push(`role=company`);
    }
    if (params.length > 0) {
      url = base + '?' + params.join('&');
    }

    // Call backend directly when not using Angular dev-server proxy
    const start = performance.now();
    console.debug('[KPI] Fetching', url);
    this.lastRequestUrl = url;
    this.http.get<any>(url).subscribe({
      next: (res) => {
        const end = performance.now();
        this.lastDurationMs = Math.round(end - start);
        console.debug(`[KPI] Response received in ${this.lastDurationMs}ms`);
        this.lastResponse = res;
        if (res && res.success && res.stats) {
          this.totalDeliveries = Number(res.stats.total) || 0;
          this.inTransit = Number(res.stats.in_transit) || 0;
          this.delivered = Number(res.stats.delivered) || 0;
        } else if (res && res.stats) {
          // fallback shapes
          this.totalDeliveries = Number(res.stats.total) || 0;
          this.inTransit = Number(res.stats.in_transit || res.stats.inTransit) || 0;
          this.delivered = Number(res.stats.delivered) || 0;
        } else {
          this.error = 'Unexpected API response';
          console.error('KPI unexpected response shape', res);
        }
        this.loading = false;
      },
      error: (err) => {
        const end = performance.now();
        this.lastDurationMs = Math.round(end - start);
        console.error('Failed to load KPI stats', err, `(${this.lastDurationMs}ms)`);
        // Try to extract useful info for the UI
        this.error = err?.message || ('Status ' + (err?.status || 'unknown'));
        this.lastResponse = err;
        this.loading = false;
      }
    });
  }
}