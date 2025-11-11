import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CompanyService, Company } from '../../../core/services/company-signup.service';

@Component({
  selector: 'app-company-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './company-signup.html',
  styleUrls: ['./company-signup.scss']
})
export class CompanySignup {
  private fb = inject(FormBuilder);
  private companyService = inject(CompanyService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  signupForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;
  selectedFile: File | null = null;

  constructor() {
    this.signupForm = this.fb.group({
      companyName: ['', [Validators.required, Validators.minLength(2)]],
      legalStatus: ['', [Validators.required]],
      taxId: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/)]],
      email: ['', [Validators.required, Validators.email]],
      Address: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      rightsConfirmation: [false, [Validators.requiredTrue]],
      termsAcceptance: [false, [Validators.requiredTrue]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  getErrorMessage(fieldName: string): string {
    const field = this.signupForm.get(fieldName);
    if (!field) return '';

    if (field.hasError('required')) {
      return 'This field is required';
    }
    if (field.hasError('email')) {
      return 'Please enter a valid email';
    }
    if (field.hasError('minlength')) {
      const minLength = field.getError('minlength').requiredLength;
      return `Minimum ${minLength} characters required`;
    }
    if (field.hasError('pattern')) {
      return 'Please enter a valid phone number';
    }
    if (fieldName === 'confirmPassword' && this.signupForm.hasError('passwordMismatch')) {
      return 'Passwords do not match';
    }
    return '';
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      // Optionnel : Upload immédiat du fichier ou prévisualisation
      console.log('File selected:', file.name);
    }
  }

  onSubmit(): void {
    // Marquer tous les champs comme touchés pour afficher les erreurs
    Object.keys(this.signupForm.controls).forEach(key => {
      this.signupForm.get(key)?.markAsTouched();
    });

    if (this.signupForm.invalid) {
      this.errorMessage = 'Please fill in all required fields correctly';
      this.successMessage = '';
      console.log('Form is invalid, showing error:', this.errorMessage);
      this.cdr.detectChanges(); // Force change detection
      // Scroll to top to show error message
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    console.log('Sending registration request...');

    const formValues = this.signupForm.value;
    
    console.log('Form values being sent:', formValues);
    
    const company: Company = {
      name: formValues.companyName,
      legal_status: formValues.legalStatus,
      tax_id: formValues.taxId,
      phone: formValues.phone,
      email: formValues.email,
      address: formValues.Address,
      password: formValues.password
      // logo_url will be handled by the file upload
    };
    
    console.log('Company object to send:', company);

    this.companyService.registerCompany(company, this.selectedFile).subscribe({
      next: (response) => {
        console.log('Inscription réussie !', response);
        this.companyService.saveUserInfo(response.user_id, response.company_id);
        this.isLoading = false;
        
        // Show success message instead of alert
        this.successMessage = 'Company registered successfully! Redirecting...';
        this.errorMessage = '';
        
        // Force change detection
        this.cdr.detectChanges();
        
        // Redirect after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 2000);
      },
      error: (error) => {
        console.error('=== ERROR OCCURRED ===');
        console.error('Erreur complète:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        console.error('Error details:', error.error);
        
        this.isLoading = false;
        this.successMessage = '';
        
        // Check for duplicate email error - backend might return 500 with duplicate key error
        const errorDetails = (error.error?.details || '').toLowerCase();
        const errorMessage = error.error?.message || error.error?.error || '';
        const errorString = JSON.stringify(error.error || '').toLowerCase();
        
        console.log('Error details string:', errorDetails);
        console.log('Error message string:', errorMessage);
        console.log('Full error JSON:', errorString);
        
        // Only show "email already registered" if we detect duplicate entry error
        if (errorDetails === 'er_dup_entry' || errorDetails === 'ER_DUP_ENTRY') {
          this.errorMessage = 'This email is already registered. Please use a different email or login instead.';
        } else if (error.status === 409) {
          this.errorMessage = 'This email is already registered. Please use a different email or login instead.';
        } else if (errorMessage) {
          this.errorMessage = errorMessage;
        } else if (error.status === 500) {
          this.errorMessage = 'Server error occurred. Please try again or contact support.';
        } else {
          this.errorMessage = 'An error occurred during registration. Please try again.';
        }
        
        console.log('Setting errorMessage to:', this.errorMessage);
        
        // Force Angular to detect the change
        this.cdr.detectChanges();
        
        // Scroll to top to show error message
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
      }
    });
  }
}