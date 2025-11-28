import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss']
})
export class SidebarComponent {
  private readonly auth = inject(AuthService);
  public readonly router = inject(Router);

  menuItems = [
    { id: 'deliveries', label: 'Deliveries', icon: 'fa-solid fa-cart-shopping', route: '/livreur/deliveries' },
    { id: 'history', label: 'History', icon: 'fa-solid fa-file-lines', route: '/livreur/deliveryall' },
    { id: 'chat', label: 'Chat', icon: 'fa-solid fa-comments', route: '/livreur/chat' },
    { id: 'settings', label: 'Settings', icon: 'fa-solid fa-gear', route: '/livreur/profilelivreur' }
  ];

  isRouteActive(route: string): boolean {
    return this.router.url === route;
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
