import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { CompanyService } from '../../../core/services/company/company.service';
import { AuthService } from '../../../core/services/auth.service';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar-company',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar-company.component.html',
  styleUrls: ['./sidebar-company.component.scss']
})
export class SidebarCompanyComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  companyName: string = 'Loading...';
  companySubtitle: string = 'Delivery';
  avatarLetter: string = 'C';
  companyId: number | null = null;
  activeMenu: string = 'orders';
  
  menuItems: MenuItem[] = [
    {
      id: 'orders',
      label: 'Orders',
      icon: 'fa-solid fa-box',
      route: '/company/commandes'
    },
    {
      id: 'drivers',
      label: 'Drivers',
      icon: 'fa-solid fa-truck',
      route: '/company/livreurs'
    },
    {
      id: 'statistics',
      label: 'Statistics',
      icon: 'fa-solid fa-chart-bar',
      route: '/company/statistiques'
    },
    {
      id: 'settings',
      label: 'Edit Profile',
      icon: 'fa-solid fa-gear',
      route: '/company/edit-profile'
    }
  ];

  constructor(
    private router: Router,
    private companyService: CompanyService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadCompanyInfo();
    this.detectActiveRoute();
    
    // Écouter les changements de route pour mettre à jour le menu actif
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        this.detectActiveRoute();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  detectActiveRoute() {
    const currentUrl = this.router.url;
    if (currentUrl.includes('/commandes')) {
      this.activeMenu = 'orders';
    } else if (currentUrl.includes('/livreurs')) {
      this.activeMenu = 'drivers';
    } else if (currentUrl.includes('/statistiques')) {
      this.activeMenu = 'statistics';
    } else if (currentUrl.includes('/edit-profile')) {
      this.activeMenu = 'settings';
    }
  }

  setActiveMenu(id: string, route: string) {
    this.activeMenu = id;
    // Navigation directe - le composant enfant se chargera automatiquement dans ngOnInit()
    this.router.navigate([route]).then(() => {
      // S'assurer que le menu actif est mis à jour après navigation
      this.detectActiveRoute();
    });
  }

  loadCompanyInfo() {
    const user = this.authService.getCurrentUser();
    if (user?.companyId) {
      this.companyId = user.companyId;
      this.companyService.getCompanyInfo(this.companyId!).subscribe({
        next: (response: any) => {
          const companyData = response.data || response;
          this.companyName = companyData.name || 'Company';
          this.avatarLetter = this.companyName.charAt(0).toUpperCase();
        },
        error: (error: any) => {
          console.error('Error loading company info:', error);
          this.companyName = 'Company';
          this.avatarLetter = 'C';
        }
      });
    }
  }

  logout() {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to logout?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, logout',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        Swal.fire({
          title: 'Logged out!',
          text: 'You have been successfully logged out.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        }).then(() => {
          this.router.navigate(['/home']);
        });
      }
    });
  }
}
