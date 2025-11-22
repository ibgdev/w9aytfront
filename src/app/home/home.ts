import { Component, inject } from '@angular/core';
import { Navbar } from '../navbar/navbar';
import { Footer } from '../footer/footer';
import { Hero } from "./hero/hero";
import { Solutions } from "./solutions/solutions";
import { HowItWorks } from "./how-it-works/how-it-works";
import { ContactUs } from "./contact-us/contact-us";
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../core/services/auth.service';
import { KpiComponent } from '../kpi/kpi';

@Component({
  selector: 'app-home',
  imports: [Navbar, Footer, Hero, Solutions, HowItWorks, ContactUs,CommonModule, KpiComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private auth = inject(AuthService);
  
  isloggedIn(): boolean {
    return this.auth.isLoggedIn();
  }
}