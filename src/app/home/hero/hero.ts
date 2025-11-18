import { Component, inject } from '@angular/core';
import { AuthService, User } from '../../core/services/auth.service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hero',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
})
export class Hero {

 private auth = inject(AuthService);
   isloggedIn (): boolean{
    return this.auth.isLoggedIn();
  }
   get currentUser(): User | null {
      return this.auth.getCurrentUser();
    }
}
