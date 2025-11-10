import { Component, HostListener, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar {
  private auth = inject(AuthService);
  private router = inject(Router);
  isMenuOpen = false;
  isScrolled = false;
  isProfileOpen = false;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 50;
  }

  get currentUser(): User | null {
    return this.auth.getCurrentUser();
  }

  isloggedIn (): boolean{
    return this.auth.isLoggedIn();
  }
  
  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleProfile(): void {
    this.isProfileOpen = !this.isProfileOpen;
  }

  logout(): void {
    this.auth.logout();
    this.isProfileOpen = false;
    this.router.navigate(['/home']);
  }
}
