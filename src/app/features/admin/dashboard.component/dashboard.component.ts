import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component/sidebar.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);

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
  }

  logout(): void {
    console.log('Déconnexion...');
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}