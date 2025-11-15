import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notfound',
  imports: [],
  templateUrl: './notfound.html',
  styleUrl: './notfound.scss',
})
export class Notfound {
  constructor(private router: Router) {}

  goToHome() {
    this.router.navigate(['/home']);
  }
}
