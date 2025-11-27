import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { SidebarComponent } from '../sidebar/sidebar.component/sidebar.component';
import { CompanyService, Company } from '../../../core/services/company.service';
import { UserService, User } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';

interface CompanyDisplay {
  id?: number;
  user_id?: number;
  name: string;
  logo_url?: string;
  tax_id?: string;
  legal_status?: string;
  dateCreation: string;
  userEmail?: string;
  userPhone?: string;
  userAddress?: string;
  userStatus?: string;
}

@Component({
  selector: 'app-gestion-companies',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HttpClientModule],
  templateUrl: './gestion-company.component.html',
  styleUrls: ['./gestion-company.component.scss'],
  providers: [CompanyService]
})
export class GestionCompany implements OnInit, OnDestroy {
  isLoading = false;
  totalCompanies = 0;
  companiesActives = 0;
  companiesSuspendues = 0;
  companies: CompanyDisplay[] = [];
  filteredCompanies: CompanyDisplay[] = [];
  searchTerm: string = '';
  showModifierCompany = false;
  showConfirmDelete = false;
  showEditUser = false;
  selectedCompany: CompanyDisplay | null = null;
  selectedUser: User | null = null;
  
  // Alert system
  alertMessage = signal('');
  alertType = signal<'success' | 'error' | 'warning' | ''>('');
  
  private routerSubscription?: Subscription;
  private auth = inject(AuthService);

  constructor(
    private companyService: CompanyService,
    private userService: UserService,
    private router: Router,
    private cdr: ChangeDetectorRef // ✅ Add ChangeDetectorRef
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

    console.log('GestionCompany ngOnInit called');
    this.loadCompanies();
    
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        console.log('Navigation to:', event.url);
        if (event.url.includes('/admin/company')) {
          this.loadCompanies();
        }
      });
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  loadCompanies(): void {
    this.isLoading = true;
    this.cdr.detectChanges();
    
    console.log('Loading companies...');
    
    this.companyService.getAllCompanies().subscribe({
      next: (response: any) => {
        const companiesArr = response.data || [];
        // Load each company and fetch its user details
        const companyPromises = companiesArr.map((company: Company) => {
          return new Promise<CompanyDisplay>((resolve) => {
            const companyDisplay = this.transformCompany(company);
            // Fetch user details if user_id exists
            if (company.user_id) {
              this.userService.getUserById(company.user_id).subscribe({
                next: (user: User) => {
                  companyDisplay.userEmail = user.email || 'N/A';
                  companyDisplay.userPhone = user.phone || 'N/A';
                  companyDisplay.userAddress = user.address || 'N/A';
                  companyDisplay.userStatus = user.status || 'active';
                  resolve(companyDisplay);
                },
                error: (err) => {
                  console.error('Error loading user for company:', company.id, err);
                  companyDisplay.userEmail = 'N/A';
                  companyDisplay.userPhone = 'N/A';
                  companyDisplay.userAddress = 'N/A';
                  companyDisplay.userStatus = 'N/A';
                  resolve(companyDisplay);
                }
              });
            } else {
              companyDisplay.userEmail = 'N/A';
              companyDisplay.userPhone = 'N/A';
              companyDisplay.userAddress = 'N/A';
              companyDisplay.userStatus = 'N/A';
              resolve(companyDisplay);
            }
          });
        });
        // Wait for all user details to be fetched
        Promise.all(companyPromises).then((companiesWithUsers) => {
          this.companies = companiesWithUsers;
          this.filteredCompanies = [...this.companies];
          this.calculateStats();
          this.isLoading = false;
          this.cdr.detectChanges();
          console.log('Companies loaded with user details:', this.companies);
        });
      },
      error: (error: any) => {
        console.error('Error loading companies:', error);
        this.isLoading = false;
        this.cdr.detectChanges();
        this.showAlert('Error loading companies', 'error');
      }
    });
  }

  transformCompany(company: Company): CompanyDisplay {
    return {
      id: company.id,
      user_id: company.user_id,
      name: company.name || '',
      logo_url: company.logo_url || '',
      tax_id: company.tax_id || 'Non défini',
      legal_status: company.legal_status || 'Non défini',
      dateCreation: company.created_at 
        ? new Date(company.created_at).toLocaleDateString('fr-FR') 
        : new Date().toLocaleDateString('fr-FR'),
      userEmail: 'Loading...',
      userPhone: 'Loading...',
      userAddress: 'Loading...',
      userStatus: 'Loading...'
    };
  }

  calculateStats(): void {
    this.totalCompanies = this.companies.length;
    this.companiesActives = this.companies.filter(c => c.userStatus === 'active').length;
    this.companiesSuspendues = this.companies.filter(c => c.userStatus === 'suspended').length;
    this.cdr.detectChanges();
  }

  // Filter companies based on search term
  filterCompanies(): void {
    const search = this.searchTerm.toLowerCase().trim();
    
    if (!search) {
      this.filteredCompanies = [...this.companies];
    } else {
      this.filteredCompanies = this.companies.filter(company => {
        const matchName = company.name?.toLowerCase().includes(search);
        const matchTaxId = company.tax_id?.toLowerCase().includes(search);
        const matchEmail = company.userEmail?.toLowerCase().includes(search);
        return matchName || matchTaxId || matchEmail;
      });
    }
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

  openModifierCompany(company: CompanyDisplay): void { 
    this.selectedCompany = { ...company }; 
    this.showModifierCompany = true;
    this.cdr.detectChanges(); // ✅ Force change detection
  }
  
  closeModifierCompany(): void { 
    this.selectedCompany = null; 
    this.showModifierCompany = false;
    this.cdr.detectChanges(); // ✅ Force change detection
  }

  openConfirmDelete(company: CompanyDisplay): void { 
    this.selectedCompany = { ...company }; 
    this.showConfirmDelete = true;
    this.cdr.detectChanges(); // ✅ Force change detection
  }
  
  closeConfirmDelete(): void { 
    this.selectedCompany = null; 
    this.showConfirmDelete = false;
    this.cdr.detectChanges(); // ✅ Force change detection
  }

  openEditUser(company: CompanyDisplay): void {
    if (!company.user_id) {
      this.showAlert('No user associated with this company', 'warning');
      return;
    }

    this.userService.getUserById(company.user_id).subscribe({
      next: (user: User) => {
        this.selectedUser = { ...user };
        this.showEditUser = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading user:', err);
        this.showAlert('Error loading user data', 'error');
      }
    });
  }

  closeEditUser(): void {
    this.selectedUser = null;
    this.showEditUser = false;
    this.cdr.detectChanges();
  }

  saveUser(): void {
    if (!this.selectedUser || !this.selectedUser.id) return;

    // Validate all required fields
    if (!this.selectedUser.name || !this.selectedUser.email || !this.selectedUser.phone || !this.selectedUser.address) {
      this.showAlert('All fields are required', 'warning');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.selectedUser.email)) {
      this.showAlert('Invalid email address', 'warning');
      return;
    }

    // Validate phone is exactly 8 digits
    const phoneRegex = /^\d{8}$/;
    if (!phoneRegex.test(this.selectedUser.phone)) {
      this.showAlert('Phone number must be exactly 8 digits', 'warning');
      return;
    }

    const userData: Partial<User> = {
      name: this.selectedUser.name,
      email: this.selectedUser.email,
      phone: this.selectedUser.phone,
      address: this.selectedUser.address
    };

    this.userService.updateUser(this.selectedUser.id, userData).subscribe({
      next: () => {
        this.showAlert('User updated successfully', 'success');
        this.loadCompanies();
        this.closeEditUser();
      },
      error: (err) => {
        console.error('Error:', err);
        const errorMessage = err.error?.message || err.error?.error || err.message || 'Unknown error';
        this.showAlert('Error updating user: ' + errorMessage, 'error');
      }
    });
  }

  modifierCompany(): void {
    if (!this.selectedCompany || 
      !this.selectedCompany.name || 
      !this.selectedCompany.tax_id || 
      !this.selectedCompany.legal_status) {
      this.showAlert('Please fill in all required fields', 'warning');
      return;
    }

    if (!this.selectedCompany || !this.selectedCompany.id) return;

    const companyData: Partial<Company> = {
      name: this.selectedCompany.name,
      tax_id: this.selectedCompany.tax_id,
      legal_status: this.selectedCompany.legal_status
    };

    this.companyService.updateCompany(this.selectedCompany.id, companyData).subscribe({
      next: () => {
        this.showAlert('Company updated successfully', 'success');
        this.loadCompanies();
        this.closeModifierCompany();
      },
      error: (err) => {
        console.error('Error:', err);
        const errorMessage = err.error?.message || err.error?.error || err.message || 'Unknown error';
        this.showAlert('Error updating company: ' + errorMessage, 'error');
      }
    });
  }
  

  supprimerCompany(): void {
    if (!this.selectedCompany || !this.selectedCompany.id) return;

    this.companyService.deleteCompany(this.selectedCompany.id).subscribe({
      next: () => {
        this.showAlert('Company deleted successfully', 'success');
        this.loadCompanies();
        this.closeConfirmDelete();
      },
      error: (err) => {
        console.error('Error:', err);
        const errorMessage = err.error?.message || err.error?.error || err.message || 'Unknown error';
        this.showAlert('Error deleting company: ' + errorMessage, 'error');
      }
    });
  }

  getLogoUrl(logoFilename: string): string {
    if (!logoFilename) return 'assets/default-company-logo.png';
    return `http://localhost:3200/uploads/${logoFilename}`;
  }
}