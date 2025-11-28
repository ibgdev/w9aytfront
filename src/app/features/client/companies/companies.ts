import { Component, OnInit, inject, signal } from '@angular/core';
import { Navbar } from '../../../navbar/navbar';
import { AllCompaniesService, PublicCompany } from '../../../core/services/all-companies.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Footer } from '../../../footer/footer';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [Navbar, Footer, RouterLink, CommonModule],
  templateUrl: './companies.html',
  styleUrl: './companies.scss',
})
export class Companies implements OnInit {
  private allCompaniesService = inject(AllCompaniesService);
  private auth = inject(AuthService);
  private router = inject(Router);

  companies = signal<PublicCompany[]>([]);
  paginatedCompanies = signal<PublicCompany[]>([]);
  isLoading = signal<boolean>(true);

  // Pagination
  currentPage = signal<number>(1);
  pageSize = 6;
  totalPages = signal<number>(0);
  pages = signal<number[]>([]);

  ngOnInit() {
    this.loadCompanies();

    if (!this.auth.isLoggedIn()) {
      this.router.navigateByUrl('/login');
      return;
    }

    const user = this.auth.getCurrentUser();
    if (user?.role !== 'client') {
      this.router.navigateByUrl('/home');
      return;
    }
  }

  loadCompanies() {
    this.isLoading.set(true);
    this.allCompaniesService.getAllCompanies().subscribe({
      next: (data) => {
        this.companies.set(data);
        this.calculatePagination();
        this.updatePaginatedCompanies();
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading companies', err);
        this.isLoading.set(false);
      },
    });
  }

  calculatePagination() {
    const total = this.companies().length;
    const pagesCount = Math.ceil(total / this.pageSize);
    this.totalPages.set(pagesCount);
    this.pages.set(Array.from({ length: pagesCount }, (_, i) => i + 1));
  }

  updatePaginatedCompanies() {
    const startIndex = (this.currentPage() - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedCompanies.set(this.companies().slice(startIndex, endIndex));
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.updatePaginatedCompanies();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
