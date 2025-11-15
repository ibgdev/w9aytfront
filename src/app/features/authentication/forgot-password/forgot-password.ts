import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss',
})
export class ForgotPassword implements OnInit {
  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.router.navigateByUrl('/home');
    }
  }

  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  forgotForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  get f(){
    return this.forgotForm.controls;
  }

  submitted = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  onSubmit() {
    this.submitted.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');
    
    if (this.forgotForm.invalid) {
      return;
    }

    const email = this.forgotForm.value.email || '';

    this.auth.forgotPassword(email).subscribe({
      next: (res) => {
        if (res.message) {
          console.log(res.message);
          this.successMessage.set(res.message || 'Reset code sent to your email');
          this.errorMessage.set('');
          
          // Redirect to reset-password page after 2 seconds
          setTimeout(() => {
            this.router.navigate(['/reset-password'], { 
              queryParams: { email: email } 
            });
          }, 2000);
        }
      },
      error: (error) => {
        console.error('ERROR', error);
        const errorMsg = error?.message || 'An error occurred. Please try again.';
        this.errorMessage.set(errorMsg);
        this.successMessage.set('');
      }
    })
  }
}
