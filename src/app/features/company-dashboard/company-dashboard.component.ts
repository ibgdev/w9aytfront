import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarCompanyComponent } from './sidebar-company/sidebar-company.component';

@Component({
  selector: 'app-company-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarCompanyComponent],
  template: `
    <div class="dashboard-layout">
      <app-sidebar-company></app-sidebar-company>
      <div class="main-content">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-layout {
      display: flex;
      min-height: 100vh;
      background: #f5f7fa;
    }

    .main-content {
      flex: 1;
      margin-left: 280px;
      overflow-x: hidden;
    }

    @media (max-width: 768px) {
      .main-content {
        margin-left: 0;
      }
    }
  `]
})
export class CompanyDashboardComponent {}
