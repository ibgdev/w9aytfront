import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss',
})
export class ResetPassword implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  email = signal('');
  currentStep = signal<'email' | 'code' | 'password'>('email');
  
  // Form for email input
  emailForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  // Form for code verification
  codeForm = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
  });

  // Form for new password
  passwordForm = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
  });

  submitted = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  isLoading = signal(false);

  get emailFormControls() {
    return this.emailForm.controls;
  }

  get codeFormControls() {
    return this.codeForm.controls;
  }

  get passwordFormControls() {
    return this.passwordForm.controls;
  }

  ngOnInit(): void {
    // Check if email is passed via query params from forgot-password page
    this.route.queryParams.subscribe(params => {
      if (params['email']) {
        this.email.set(params['email']);
        this.emailForm.patchValue({ email: params['email'] });
        // If email is provided, we can start from email step or code step
        // For now, we'll start from code step if email is provided
        this.currentStep.set('code');
      }
    });

    if (this.auth.isLoggedIn()) {
      this.router.navigateByUrl('/home');
    }
  }

  // Step 1: Send forgot password email
  onSubmitEmail() {
    this.submitted.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');
    
    if (this.emailForm.invalid) {
      return;
    }

    this.isLoading.set(true);
    const email = this.emailForm.value.email || '';

    this.auth.forgotPassword(email).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.successMessage.set(res.message || 'Reset code sent to your email');
        this.errorMessage.set('');
        this.email.set(email);
        
        // Move to code verification step
        setTimeout(() => {
          this.currentStep.set('code');
          this.submitted.set(false);
          this.successMessage.set('');
        }, 1500);
      },
      error: (error) => {
        this.isLoading.set(false);
        console.error('ERROR', error);
        const errorMsg = error?.message || 'An error occurred. Please try again.';
        this.errorMessage.set(errorMsg);
        this.successMessage.set('');
      }
    });
  }

  // Step 2: Verify reset code
  onSubmitCode() {
    this.submitted.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');
    
    if (this.codeForm.invalid) {
      return;
    }

    this.isLoading.set(true);
    const code = this.codeForm.value.code || '';

    this.auth.verifyResetCode({ email: this.email(), code }).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.successMessage.set(res.message || 'Code verified successfully');
        this.errorMessage.set('');
        
        // Move to password reset step
        setTimeout(() => {
          this.currentStep.set('password');
          this.submitted.set(false);
          this.successMessage.set('');
        }, 1500);
      },
      error: (error) => {
        this.isLoading.set(false);
        console.error('ERROR', error);
        const errorMsg = error?.message || 'Invalid or expired code. Please try again.';
        this.errorMessage.set(errorMsg);
        this.successMessage.set('');
      }
    });
  }

  // Step 3: Reset password
  onSubmitPassword() {
    this.submitted.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');
    
    if (this.passwordForm.invalid) {
      return;
    }

    const newPassword = this.passwordForm.value.newPassword || '';
    const confirmPassword = this.passwordForm.value.confirmPassword || '';

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      this.errorMessage.set('Passwords do not match');
      return;
    }

    this.isLoading.set(true);

    this.auth.resetPassword({ email: this.email(), newPassword }).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.successMessage.set(res.message || 'Password reset successfully');
        this.errorMessage.set('');
        
        // Redirect to login page after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading.set(false);
        console.error('ERROR', error);
        const errorMsg = error?.message || 'An error occurred. Please try again.';
        this.errorMessage.set(errorMsg);
        this.successMessage.set('');
      }
    });
  }

  // Navigate back to previous step
  goToPreviousStep() {
    if (this.currentStep() === 'code') {
      this.currentStep.set('email');
      this.submitted.set(false);
      this.errorMessage.set('');
      this.successMessage.set('');
    } else if (this.currentStep() === 'password') {
      this.currentStep.set('code');
      this.submitted.set(false);
      this.errorMessage.set('');
      this.successMessage.set('');
    }
  }
}
