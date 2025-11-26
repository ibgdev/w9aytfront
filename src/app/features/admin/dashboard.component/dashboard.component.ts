import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component/sidebar.component';
import { AuthService } from '../../../core/services/auth.service';
import { AllCompaniesService } from '../../../core/services/all-companies.service';
import { UserService } from '../../../core/services/user.service';
import { CompanyService } from '../../../core/services/company.service';
import { ContactService } from '../../../core/services/contact.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private allCompaniesService = inject(AllCompaniesService);
  private userService = inject(UserService);
  private companyService = inject(CompanyService);
  private contactService = inject(ContactService);
  private cdr = inject(ChangeDetectorRef);

  // Dashboard statistics
  totalCompanies = 0;
  totalUsers = 0;
  totalCompanyRequests = 0;
  totalContactMessages = 0;

  // Loading state
  isLoading = true;

  ngOnInit(): void {
    // Check if user is logged in
    if (!this.auth.isLoggedIn()) {
      this.router.navigateByUrl('/login');
      return;
    }

    // Check if user is admin
    const user = this.auth.getCurrentUser();
    if (user?.role !== 'admin') {
      this.router.navigateByUrl('/home');
      return;
    }

    // Fetch all dashboard data
    this.loadDashboardData();

    // Listen for visibility change to reload data fast
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.loadDashboardData();
        this.cdr.detectChanges();
      }
    });
  }

  loadDashboardData(): void {
    this.isLoading = true;

    forkJoin({
      companies: this.allCompaniesService.getAllCompanies(),
      users: this.userService.getAllUsers(),
      companyRequests: this.companyService.getAllCompanies(),
      contacts: this.contactService.getAllContacts()
    }).subscribe({
      next: (data) => {
        this.totalCompanies = data.companies?.length || 0;
        this.totalUsers = data.users?.length || 0;
        // Only count users with status 'suspended' for demandes
        this.totalCompanyRequests = Array.isArray(data.users)
          ? data.users.filter(user => user.status === 'suspended').length
          : 0;
        this.totalContactMessages = data.contacts?.data?.length || 0;

        console.log('Dashboard data loaded:', {
          companies: this.totalCompanies,
          users: this.totalUsers,
          requests: this.totalCompanyRequests,
          messages: this.totalContactMessages
        });

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading dashboard data:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  logout(): void {
    console.log('Déconnexion...');
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}