import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CompanyService } from '../../../core/services/company/company.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  profileForm!: FormGroup;
  loading: boolean = false;
  saving: boolean = false;
  message: string = '';
  messageType: 'success' | 'error' = 'success';
  companyId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private companyService: CompanyService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.initForm();
  }

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (user?.companyId) {
      this.companyId = user.companyId;
      // Charger les données immédiatement au démarrage
      this.loadCompanyProfile();
    }

    // Recharger les données à chaque navigation vers cette route
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        if (event.url.includes('/edit-profile')) {
          if (this.companyId) {
            this.loadCompanyProfile();
          }
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm() {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      tax_id: [''],
      legal_status: [''],
      contact_name: ['', Validators.required],
      email: [{ value: '', disabled: true }],
      phone: ['', Validators.required],
      address: ['', Validators.required]
    });
  }

  loadCompanyProfile() {
    if (!this.companyId) return;

    this.loading = true;
    this.companyService.getCompanyProfile(this.companyId!).subscribe({
      next: (response: any) => {
        const data = response.data;
        this.profileForm.patchValue({
          name: data.name || '',
          tax_id: data.tax_id || '',
          legal_status: data.legal_status || '',
          contact_name: data.contact_name || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || ''
        });
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error loading profile:', error);
        this.message = 'Failed to load company profile';
        this.messageType = 'error';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  saveProfile() {
    if (!this.profileForm.valid || !this.companyId) {
      this.message = 'Please fill all required fields';
      this.messageType = 'error';
      return;
    }

    this.saving = true;
    const formValue = this.profileForm.getRawValue();

    this.companyService.updateCompanyProfile(this.companyId!, formValue).subscribe({
      next: (response: any) => {
        this.message = 'Profile updated successfully!';
        this.messageType = 'success';
        this.saving = false;

        // Clear message after 3 seconds
        setTimeout(() => {
          this.message = '';
          this.cdr.detectChanges();
        }, 3000);
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error updating profile:', error);
        this.message = error.message || 'Failed to update profile';
        this.messageType = 'error';
        this.saving = false;
        this.cdr.detectChanges();
      }
    });
  }

  resetForm() {
    this.loadCompanyProfile();
    this.message = '';
  }
}
