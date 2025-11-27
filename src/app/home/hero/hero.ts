import { Component, inject } from '@angular/core';
import { AuthService, User } from '../../core/services/auth.service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hero',
  imports: [CommonModule, RouterLink],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
})
export class Hero {

  isMenuOpen: boolean = false;

 private auth = inject(AuthService);
 private router = inject(Router);

   isloggedIn (): boolean{
    return this.auth.isLoggedIn();
  }
   get currentUser(): User | null {
      return this.auth.getCurrentUser();
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
}
