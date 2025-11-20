import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { SidebarComponent } from '../sidebar/sidebar.component/sidebar.component';
import { CompanyService, Company } from '../../../core/services/company.service';

interface CompanyDisplay {
  id?: number;
  user_id?: number;
  name: string;
  logo_url?: string;
  tax_id?: string;
  legal_status?: string;
  dateCreation: string;
  email?: string;
  phone?: string;
  address?: string;
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
  companiesVerifiees = 0;
  companies: CompanyDisplay[] = [];
  showModifierCompany = false;
  showConfirmDelete = false;
  selectedCompany: CompanyDisplay | null = null;
  private routerSubscription?: Subscription;

  constructor(
    private companyService: CompanyService,
    private router: Router,
    private cdr: ChangeDetectorRef // ✅ Add ChangeDetectorRef
  ) {}

  ngOnInit(): void {
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
    this.cdr.detectChanges(); // ✅ Force change detection
    
    console.log('Loading companies...');
    
    this.companyService.getAllCompanies().subscribe({
      next: (companies: Company[]) => {
        console.log('Companies received:', companies);
        this.companies = companies.map(company => this.transformCompany(company));
        this.calculateStats();
        this.isLoading = false;
        this.cdr.detectChanges(); // ✅ Force change detection
        console.log('Companies loaded:', this.companies);
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des companies:', error);
        this.isLoading = false;
        this.cdr.detectChanges(); // ✅ Force change detection
        alert('Erreur lors du chargement des companies.');
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
        : new Date().toLocaleDateString('fr-FR')
    };
  }

  calculateStats(): void {
    this.totalCompanies = this.companies.length;
    this.companiesActives = this.companies.filter(c => c.legal_status !== 'suspended').length;
    this.companiesSuspendues = this.companies.filter(c => c.legal_status === 'suspended').length;
    this.companiesVerifiees = this.companies.filter(c => c.tax_id && c.tax_id !== 'Non défini').length;
    this.cdr.detectChanges(); // ✅ Force change detection
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

  modifierCompany(): void {
    if (!this.selectedCompany || 
      !this.selectedCompany.name || 
      !this.selectedCompany.tax_id || 
      !this.selectedCompany.legal_status) {
    alert('Veuillez remplir tous les champs obligatoires');
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
        alert('Société modifiée avec succès');
        this.loadCompanies();
        this.closeModifierCompany();
      },
      error: (err) => {
        console.error('Erreur complète:', err);
        const errorMessage = err.error?.message || err.error?.error || err.message || 'Erreur inconnue';
        alert('Erreur modification société: ' + errorMessage);
      }
    });
  }
  

  supprimerCompany(): void {
    if (!this.selectedCompany || !this.selectedCompany.id) return;

    this.companyService.deleteCompany(this.selectedCompany.id).subscribe({
      next: () => {
        alert('Société supprimée avec succès');
        this.loadCompanies();
        this.closeConfirmDelete();
      },
      error: (err) => {
        console.error('Erreur complète:', err);
        const errorMessage = err.error?.message || err.error?.error || err.message || 'Erreur inconnue';
        alert('Erreur suppression société: ' + errorMessage);
      }
    });
  }

  getLogoUrl(logoFilename: string): string {
    if (!logoFilename) return 'assets/default-company-logo.png';
    return `http://localhost:3200/uploads/${logoFilename}`;
  }
}