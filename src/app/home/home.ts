import { Component } from '@angular/core';
import { Navbar } from '../navbar/navbar';
import { Footer } from '../footer/footer';
import { Hero } from "./hero/hero";
import { Solutions } from "./solutions/solutions";
import { HowItWorks } from "./how-it-works/how-it-works";
import { ContactUs } from "./contact-us/contact-us";

@Component({
  selector: 'app-home',
  imports: [Navbar, Footer, Hero, Solutions, HowItWorks, ContactUs],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {

}
