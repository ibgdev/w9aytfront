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
      const params = new URLSearchParams(window.location.search);
  if (params.get('verified') === 'true') {
    if (params.get('already') === 'true') {
      this.showMessage('Your account is already verified. Please login.');
    } else {
      this.showMessage('Email verified successfully! You can now login.');
    }
  }
  }
  
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router); 

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required] 
  });

  submitted = signal(false);
  loading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  showResendButton = signal(false);
  resendEmail = signal('');
  resendLoading = signal(false);
  resendSuccess = signal('');

  get f() {
    return this.loginForm.controls;
  }

  private showMessage(message: string) {
    this.successMessage.set(message);
    setTimeout(() => {
      this.successMessage.set('');
    }, 5000);
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
        
        // Check if it's a verification error (403)
        if (err.message && err.message.includes('verify your email')) {
          this.errorMessage.set(err.message);
          this.showResendButton.set(true);
          this.resendEmail.set(email!);
        } else {
          this.errorMessage.set(err.message || 'Invalid credentials');
          this.showResendButton.set(false);
        }
      }
    });
  }

  resendVerificationEmail() {
    this.resendLoading.set(true);
    this.resendSuccess.set('');
    this.errorMessage.set('');

    this.auth.resendVerification(this.resendEmail()).subscribe({
      next: (res) => {
        this.resendLoading.set(false);
        if (res.success) {
          this.resendSuccess.set(res.message);
          this.showResendButton.set(false);
        }
      },
      error: (err) => {
        this.resendLoading.set(false);
        this.errorMessage.set(err.message || 'Failed to resend verification email');
      }
    });
  }
}
