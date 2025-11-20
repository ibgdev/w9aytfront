import { Component, OnInit, ChangeDetectorRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService, User } from '../../../core/services/user.service';
import { CompanyService, Company } from '../../../core/services/company.service';
import { SidebarComponent } from '../sidebar/sidebar.component/sidebar.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-validation-demandes',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './validation-demandes.component.html',
  styleUrls: ['./validation-demandes.component.scss']
})
export class ValidationDemandesComponent implements OnInit {
  
  users: User[] = [];
  isLoading = false;
  showCompanyDetails = false;
  selectedCompany: Company | null = null;
  
  // Alert system
  alertMessage = signal('');
  alertType = signal<'success' | 'error' | 'warning' | ''>('');
  
  private auth = inject(AuthService);
  private router = inject(Router);

  constructor(
    private userService: UserService,
    private companyService: CompanyService,
    private cdr: ChangeDetectorRef // ✅ Ajouté
  ) {}

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

    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.cdr.detectChanges(); // ✅ Force change detection
    
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        // Filter to show only suspended users
        this.users = users.filter(user => user.status === 'suspended');
        this.isLoading = false;
        this.cdr.detectChanges(); // ✅ Force change detection
      },
      error: (error) => {
        console.error('Error:', error);
        this.isLoading = false;
        this.cdr.detectChanges(); // ✅ Force change detection
      }
    });
  }

  // Approve user - change status to "active"
  approveUser(user: User): void {
    if (!user.id) return;
    
    this.userService.updateUser(user.id, { status: 'active' }).subscribe({
      next: () => {
        this.showAlert('User approved successfully', 'success');
        this.loadUsers();
      },
      error: (error) => {
        console.error(error);
        this.showAlert('Error approving user', 'error');
      }
    });
  }

  // Reject user - change status to "banned"  
  rejectUser(user: User): void {
    if (!user.id) return;
    
    this.userService.updateUser(user.id, { status: 'banned' }).subscribe({
      next: () => {
        this.showAlert('User rejected successfully', 'success');
        this.loadUsers();
      },
      error: (error) => {
        console.error(error);
        this.showAlert('Error rejecting user', 'error');
      }
    });
  }

  getStatusText(status: string | undefined): string {
    if (status === 'active') return 'Active';
    if (status === 'banned') return 'Banned';
    if (status === 'suspended') return 'Suspended';
    return 'Pending';
  }

  // View company details
  viewCompanyDetails(user: User): void {
    if (!user.id) return;
    
    // Fetch all companies and find the one associated with this user
    this.companyService.getAllCompanies().subscribe({
      next: (companies) => {
        const company = companies.find(c => c.user_id === user.id);
        if (company) {
          this.selectedCompany = company;
          this.showCompanyDetails = true;
          this.cdr.detectChanges();
        } else {
          alert('No company found for this user');
        }
      },
      error: (error) => {
        console.error('Error loading company:', error);
        alert('Error loading company details');
      }
    });
  }

  // Close company details modal
  closeCompanyDetails(): void {
    this.showCompanyDetails = false;
    this.selectedCompany = null;
    this.cdr.detectChanges();
  }

  // Show alert message
  showAlert(message: string, type: 'success' | 'error' | 'warning'): void {
    this.alertMessage.set(message);
    this.alertType.set(type);
    this.cdr.detectChanges();
    setTimeout(() => {
      this.alertMessage.set('');
      this.alertType.set('');
      this.cdr.detectChanges();
    }, 5000);
  }
}