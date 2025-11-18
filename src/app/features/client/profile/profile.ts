import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, User } from '../../../core/services/auth.service';
import { Navbar } from '../../../navbar/navbar';
import { Footer } from "../../../footer/footer";
import { ProfileService } from '../../../core/services/profile.service';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, ReactiveFormsModule, Navbar, Footer],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private profile = inject(ProfileService);
  private router = inject(Router);

  currentUser = signal<User | null>(null);
  activeTab = signal<'profile' | 'security' | 'danger'>('profile');
  
  // Profile update form
  profileForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: [{ value: '', disabled: true }], // Email cannot be updated
    phone: ['', [Validators.required, Validators.minLength(8)]],
    address: ['', [Validators.required, Validators.minLength(5)]],
  });

  // Password change form
  passwordForm = this.fb.group({
    currentPassword: ['', [Validators.required, Validators.minLength(6)]],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
  });

  // Delete account form
  deleteForm = this.fb.group({
    password: ['', [Validators.required]],
    confirmation: ['', [Validators.required]],
  });

  // Signals for UI state
  profileSubmitted = signal(false);
  passwordSubmitted = signal(false);
  deleteSubmitted = signal(false);
  
  successMessage = signal('');
  errorMessage = signal('');
  isLoading = signal(false);
  
  showDeleteModal = signal(false);

  get profileControls() {
    return this.profileForm.controls;
  }

  get passwordControls() {
    return this.passwordForm.controls;
  }

  get deleteControls() {
    return this.deleteForm.controls;
  }

  ngOnInit(): void {
    // Check if user is logged in
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    // Get current user data
    const user = this.auth.getCurrentUser();
    if (user) {
      this.currentUser.set(user);
      this.profileForm.patchValue({
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
      });
    }
  }

  // Switch between tabs
  switchTab(tab: 'profile' | 'security' | 'danger') {
    this.activeTab.set(tab);
    this.clearMessages();
    this.resetForms();
  }

  // Update profile information
  onUpdateProfile() {
    this.profileSubmitted.set(true);
    this.clearMessages();

    if (this.profileForm.invalid) {
      return;
    }

    this.isLoading.set(true);

    // Get form values with proper typing
    // Email is disabled in the form, so get it from current user
    const formData = {
      name: this.profileForm.value.name || '',
      email: this.currentUser()?.email || '', // Get email from current user since field is disabled
      phone: this.profileForm.value.phone || '',
      address: this.profileForm.value.address || ''
    };

    this.profile.updateProfile(formData).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.successMessage.set('Profile updated successfully');
        // Update local user data
        const updatedUser: User = { 
          ...this.currentUser()!, 
          name: formData.name,
          phone: formData.phone,
          address: formData.address
        };
        this.currentUser.set(updatedUser);
        this.auth.saveSession(this.auth.getToken()!, updatedUser);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error?.message || 'Failed to update profile');
      }
    });
  }

  // Change password
  onChangePassword() {
    this.passwordSubmitted.set(true);
    this.clearMessages();

    if (this.passwordForm.invalid) {
      return;
    }

    // Check if passwords match
    const newPassword = this.passwordForm.value.newPassword;
    const confirmPassword = this.passwordForm.value.confirmPassword;

    if (newPassword !== confirmPassword) {
      this.errorMessage.set('New passwords do not match');
      return;
    }

    this.isLoading.set(true);

    // First, verify the current password
    this.profile.verifyPassword({
      email: this.currentUser()?.email || '',
      currentPassword: this.passwordForm.value.currentPassword || ''
    }).subscribe({
      next: (verifyResponse) => {
        // Current password is correct, proceed with password reset
        this.auth.resetPassword({
          email: this.currentUser()?.email || '',
          newPassword: this.passwordForm.value.newPassword!
        }).subscribe({
          next: (response) => {
            this.isLoading.set(false);
            this.successMessage.set('Password changed successfully');
            this.passwordForm.reset();
            this.passwordSubmitted.set(false);
          },
          error: (error) => {
            this.isLoading.set(false);
            this.errorMessage.set(error?.message || 'Failed to change password');
          }
        });
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error?.message || 'Current password is incorrect');
      }
    });
  }

  // Open delete account modal
  openDeleteModal() {
    this.showDeleteModal.set(true);
    this.clearMessages();
  }

  // Close delete account modal
  closeDeleteModal() {
    this.showDeleteModal.set(false);
    this.deleteForm.reset();
    this.deleteSubmitted.set(false);
    this.clearMessages();
  }

  // Delete account
  onDeleteAccount() {
    this.deleteSubmitted.set(true);
    this.clearMessages();

    if (this.deleteForm.invalid) {
      return;
    }

    // Check if user typed "DELETE" to confirm
    const confirmation = this.deleteForm.value.confirmation?.toUpperCase();
    if (confirmation !== 'DELETE') {
      this.showDeleteModal.set(false);
      this.errorMessage.set('Please type DELETE to confirm account deletion');
      return;
    }

    this.isLoading.set(true);

    this.profile.deleteAccount({
      UserId: this.currentUser()?.id!,
      email: this.currentUser()?.email!,
      password: this.deleteForm.value.password!
    }).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.successMessage.set('Account deleted successfully. Redirecting...');
        setTimeout(() => {
          this.auth.logout();
          this.router.navigate(['/']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error?.message || 'Failed to delete account');
      }
    });

    // Temporary simulation
    setTimeout(() => {
      this.isLoading.set(false);
      this.successMessage.set('Account deleted successfully. Redirecting...');
      setTimeout(() => {
        this.auth.logout();
        this.router.navigate(['/']);
      }, 2000);
    }, 1000);
  }

  // Logout
  onLogout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  // Helper methods
  clearMessages() {
    this.successMessage.set('');
    this.errorMessage.set('');
  }

  resetForms() {
    this.profileSubmitted.set(false);
    this.passwordSubmitted.set(false);
    this.deleteSubmitted.set(false);
  }

  // Format date for display
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (error) {
      return 'N/A';
    }
  }

  // Get member since date (supports both created_at and createdAt)
  getMemberSince(): string {
    const user = this.currentUser();
    if (!user) return 'N/A';
    
    const dateString = user.createdAt || user.created_at;
    return this.formatDate(dateString || '');
  }
}
