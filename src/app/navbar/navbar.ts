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
  isDeliveryOpen = false;

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

  toggleDeliveryMenu(): void {
    this.isDeliveryOpen = !this.isDeliveryOpen;
  }

  closeDeliveryMenu(): void {
    this.isDeliveryOpen = false;
    this.isMenuOpen = false;
  }

  scrollToSection(sectionId: string): void {
    // Close mobile menu if open
    this.isMenuOpen = false;
    
    // Check if we're on the home page
    if (this.router.url !== '/home' && this.router.url !== '/') {
      // Navigate to home first, then scroll
      this.router.navigate(['/home']).then(() => {
        setTimeout(() => {
          this.scrollToElement(sectionId);
        }, 100);
      });
    } else {
      // Already on home page, just scroll
      this.scrollToElement(sectionId);
    }
  }

  private scrollToElement(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      const navbarHeight = 80; // Adjust based on your navbar height
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - navbarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }

  logout(): void {
    this.auth.logout();
    this.isProfileOpen = false;
    this.router.navigate(['/home']);
  }
}
