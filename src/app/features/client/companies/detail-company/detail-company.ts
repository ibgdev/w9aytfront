import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Navbar } from '../../../../navbar/navbar';
import { Footer } from '../../../../footer/footer';
import { AllCompaniesService, PublicCompany } from '../../../../core/services/all-companies.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-detail-company',
  standalone: true,
  imports: [CommonModule, Navbar, Footer],
  templateUrl: './detail-company.html',
  styleUrl: './detail-company.scss',
})
export class DetailCompany implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private allCompaniesService = inject(AllCompaniesService);

    private auth = inject(AuthService);

  company = signal<PublicCompany | null>(null);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadCompanyDetails(+id);
    } else {
      this.error.set('Invalid company ID');
      this.isLoading.set(false);
    }

        if (!this.auth.isLoggedIn()) {
      this.router.navigateByUrl('/login');
      return;
    }

    // Check if user is admin
    const user = this.auth.getCurrentUser();
    if (user?.role !== 'client') {
      this.router.navigateByUrl('/home');
      return;
    }
  }

  loadCompanyDetails(id: number) {
    this.isLoading.set(true);
    this.error.set(null);
    
    this.allCompaniesService.getCompanyById(id).subscribe({
      next: (data) => {
        if (data) {
          this.company.set(data);
        } else {
          this.error.set('Company does not exist');
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading company details', err);
        if (err.status === 404) {
          this.error.set('Company does not exist');
        } else {
          this.error.set('Failed to load company details');
        }
        this.isLoading.set(false);
      }
    });
  }

  goBack() {
    this.router.navigate(['/companies']);
  }
}
