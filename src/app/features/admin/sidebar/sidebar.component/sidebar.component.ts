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
      icon: '👥',
      label: 'Gestion des Utilisateurs',
      route: '/admin/gestion-utilisateurs' // ✅ Vérifier qu'il n'y a pas d'espace
    },
    {
      icon: '🏢',
      label: 'Gestion des Sociétés',
      route: '/admin/company'
    },
   
    {
      icon: '✓',
      label: 'Validation Demandes',
      route: '/admin/validation'
    },
    {
      icon: '📈',
      label: 'Tableau de bord',
      route: '/admin/dashboard'
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
