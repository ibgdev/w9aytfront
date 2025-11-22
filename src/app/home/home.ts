import { Component, inject, OnInit } from '@angular/core';
import { Navbar } from '../navbar/navbar';
import { Footer } from '../footer/footer';
import { Hero } from "./hero/hero";
import { Solutions } from "./solutions/solutions";
import { HowItWorks } from "./how-it-works/how-it-works";
import { ContactUs } from "./contact-us/contact-us";
import { AuthService } from '../core/services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { KpiComponent } from '../kpi/kpi';

@Component({
  selector: 'app-home',
  imports: [Navbar, Footer, Hero, Solutions, HowItWorks, ContactUs,CommonModule, KpiComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);

  isloggedIn(): boolean {
    return this.auth.isLoggedIn();
  }

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    if (user?.role == 'client') {
      // this.router.navigateByUrl('/home');
      // return;
    }
    if (user?.role == 'admin') {
      this.router.navigateByUrl('/admin');
      return;
    }
    if (user?.role == 'company') {
      // this.router.navigateByUrl('/home');
      // return;
    }
    if (user?.role == 'driver') {
      // this.router.navigateByUrl('/driver');
      // return;
    }
  }
}