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
  private readonly router = inject(Router);

  menuItems = [
    { id: 'deliveries', label: 'Deliveries', icon: 'fa-solid fa-cart-shopping', route: '/livreur/deliveries' },
    { id: 'history', label: 'History', icon: 'fa-solid fa-file-lines', route: '/livreur/deliveryall' },
    { id: 'chat', label: 'Chat', icon: 'fa-solid fa-comments', route: '/livreur/chat' },
    { id: 'settings', label: 'Settings', icon: 'fa-solid fa-gear', route: '/livreur/profilelivreur' }
  ];

  activeMenu = 'dashboard';

  setActiveMenu(id: string, route?: string) {
    this.activeMenu = id;
    if (route) {
      this.router.navigate([route]);
    }
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/home']);
  }
}
