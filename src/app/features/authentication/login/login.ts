import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [RouterLink, FormsModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'] // Fixed property name
})
export class Login implements OnInit {
  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.router.navigateByUrl('/home')
    }
  }
  
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router); // Corrected import

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required] 
  });

  submitted = signal(false);
  loading = signal(false);
  errorMessage = signal('');

  get f() {
    return this.loginForm.controls;
  }

  onSubmit() {
    this.submitted.set(true);
    this.errorMessage.set('');

    if (this.loginForm.invalid) {
      return;
    }

    this.loading.set(true);

    const { email, password } = this.loginForm.value;

    this.auth.login({ email: email!, password: password! }).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success && res.token && res.user) {
          this.auth.saveSession(res.token, res.user);
          this.router.navigateByUrl('/home'); // Fixed method name
        } else {
          this.errorMessage.set('Invalid credentials');
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set('Invalid credentials');
      }
    });
  }
}
