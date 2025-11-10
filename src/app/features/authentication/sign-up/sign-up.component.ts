import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, SignUpRequest } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss'
})
export class SignUpComponent implements OnInit {
    ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigateByUrl('/home')
    }
  }
  private readonly authService = inject(AuthService);
  private router = inject(Router);  

  // Formulaire
  formData = signal<SignUpRequest>({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: ''
  });

  // États
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  fieldErrors = signal<Record<string, string>>({});
  termsAccepted = signal(false);

  onSubmit(): void {
    // Reset messages
    this.errorMessage.set('');
    this.successMessage.set('');
    this.fieldErrors.set({});

    // Validation
    if (!this.termsAccepted()) {
      this.errorMessage.set('You must accept terms and policy');
      return;
    }

    if (!this.validateForm()) {
      return;
    }

    // Appel API
    this.isLoading.set(true);

    this.authService.signUp(this.formData()).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.success) {
          this.successMessage.set(response.message);
          // Reset form
          this.formData.set({
            name: '',
            email: '',
            phone: '',
            address: '',
            password: ''
          });
          this.termsAccepted.set(false);
          
          
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        
        if (error.errors && Array.isArray(error.errors)) {
          // Erreurs de validation
          const errors: Record<string, string> = {};
          error.errors.forEach((err: any) => {
            errors[err.field] = err.message;
          });
          this.fieldErrors.set(errors);
        } else {
          // Erreur générale
          this.errorMessage.set(error.message || 'Registration failed. Please try again.');
        }
      }
    });
  }

  private validateForm(): boolean {
    const data = this.formData();
    const errors: Record<string, string> = {};

    if (!data.name || data.name.length < 3) {
      errors['name'] = 'Name must be at least 3 characters';
    }

    if (!data.email || !this.isValidEmail(data.email)) {
      errors['email'] = 'Please enter a valid email';
    }

    if (!data.phone || data.phone.length < 8) {
      errors['phone'] = 'Please enter a valid phone number';
    }

    if (!data.address || data.address.length < 10) {
      errors['address'] = 'Address must be at least 10 characters';
    }

    if (!data.password || data.password.length < 6) {
      errors['password'] = 'Password must be at least 6 characters';
    }

    if (Object.keys(errors).length > 0) {
      this.fieldErrors.set(errors);
      return false;
    }

    return true;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  updateField(field: keyof SignUpRequest, value: string): void {
    this.formData.update(current => ({
      ...current,
      [field]: value
    }));
  }
}