import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar';
import { User } from '../../../core/models/user.model';
import { ProfileLivreurService } from '../../../core/services/profilelivreur.service';

@Component({
  selector: 'app-profilelivreur',
  standalone: true,
  imports: [CommonModule, SidebarComponent, ReactiveFormsModule],
  templateUrl: './profilelivreur.html',
  styleUrls: ['./profilelivreur.scss']
})
export class ProfileLivreurComponent implements OnInit {
  user = signal<User | null>(null);
  profileForm!: FormGroup;
  userInitials = signal<string>('');
  isLoading = signal<boolean>(false);
  updateSuccess = signal<boolean>(false); // message succès

  constructor(
    private readonly profileService: ProfileLivreurService,
    private readonly fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      name: [''],
      email: [{ value: '', disabled: true }],
      phone: [''],
      address: [''],
      password: [''],
      confirmPassword: ['']
    }, { validators: this.passwordMatchValidator });

    this.loadProfile();

    // Réinitialiser le message si l'utilisateur modifie le formulaire
    this.profileForm.valueChanges.subscribe(() => this.updateSuccess.set(false));
  }

  loadProfile(): void {
    this.profileService.getProfile().subscribe({
      next: (u: User) => {
        this.user.set(u);
        this.profileForm.patchValue({
          name: u.name || '',
          email: u.email || '',
          phone: u.phone || '',
          address: u.address || ''
        });
        this.generateInitials();
        this.profileForm.get('name')?.valueChanges.subscribe(() => this.generateInitials());
      },
      error: (err: any) => console.error('Erreur lors du chargement du profil:', err)
    });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    if (!password && !confirmPassword) return null;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  passwordsMatch(): boolean {
    const pass = this.profileForm.controls['password']?.value;
    const confirm = this.profileForm.controls['confirmPassword']?.value;
    if (!pass && !confirm) return true;
    return pass === confirm;
  }

  generateInitials(): void {
    const name: string = this.profileForm.get('name')?.value || this.user()?.name || '';
    const parts = name.trim().split(' ').filter(p => p.length > 0);
    if (parts.length >= 2) {
      this.userInitials.set((parts[0][0] + parts[parts.length - 1][0]).toUpperCase());
    } else if (parts.length === 1) {
      this.userInitials.set(parts[0].substring(0, 2).toUpperCase());
    } else {
      this.userInitials.set('U');
    }
  }

  onSaveChanges(): void {
    this.isLoading.set(true);
    const formValue = this.profileForm.getRawValue();

    const updatedUser: Partial<User> = {
      id: this.user()?.id,
      name: formValue.name,
      email: this.user()?.email,
      phone: formValue.phone,
      address: formValue.address,
      ...(formValue.password && { password: formValue.password })
    };

    this.profileService.updateProfile(updatedUser).subscribe({
      next: (user: User) => {
        this.user.set(user);
        this.isLoading.set(false);
        this.profileForm.get('password')?.reset();
        this.profileForm.get('confirmPassword')?.reset();

        // Afficher le message succès pendant 3 secondes
        this.updateSuccess.set(true);
        setTimeout(() => this.updateSuccess.set(false), 3000);
      },
      error: (err: any) => {
        this.isLoading.set(false);
        console.error('Erreur lors de la mise à jour:', err);
      }
    });
  }

  onDeleteAccount(): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer votre compte ?')) return;
    this.isLoading.set(true);
    this.profileService.deleteAccount().subscribe({
      next: () => this.isLoading.set(false),
      error: (err: any) => {
        this.isLoading.set(false);
        console.error('Erreur lors de la suppression:', err);
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      if (control instanceof FormGroup) this.markFormGroupTouched(control);
    });
  }

  get isFormValid(): boolean {
    return this.profileForm?.valid || false;
  }

  get hasPasswordValue(): boolean {
    return !!this.profileForm?.get('password')?.value;
  }
}
