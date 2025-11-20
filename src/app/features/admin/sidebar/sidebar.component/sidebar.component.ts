import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router'; // ✅ VÉRIFIER CETTE LIGNE

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule], // ✅ RouterModule doit être ici
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  menuItems = [
    {
      icon: 'fas fa-chart-line',
      label: 'Dashboard',
      route: '/admin'
    },
    {
      icon: 'fas fa-users-cog',
      label: 'User Management',
      route: '/admin/gestion-utilisateurs'
    },
    {
      icon: 'fas fa-building',
      label: 'Company Management',
      route: '/admin/company'
    },
    {
      icon: 'fas fa-check-circle',
      label: 'Validate Requests',
      route: '/admin/validation'
    }
  ];

  constructor(public router: Router) {}

  // ✅ ADD THIS METHOD
  navigateTo(route: string): void {
    // If already on the same route, force reload
    if (this.router.url === route) {
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate([route]);
      });
    } else {
      this.router.navigate([route]);
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}
