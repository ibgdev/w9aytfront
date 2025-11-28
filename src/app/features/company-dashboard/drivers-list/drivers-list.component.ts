import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import Swal from 'sweetalert2';
import {
  DriverService,
  Driver,
  AddDriverRequest,
  DriverResponse,
} from '../../../core/services/company/driver.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-drivers-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './drivers-list.component.html',
  styleUrls: ['./drivers-list.component.scss'],
})
export class DriversListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private errorTimeout: any = null;
  drivers: Driver[] = [];
  searchTerm: string = '';
  showAddModal: boolean = false;
  showEditModal: boolean = false;
  showDetailsModal: boolean = false;
  loading: boolean = false;
  error: string = '';
  selectedDriver: any = null;
  showErrorAlert: boolean = false;
  
  currentUser: any = null;

  newDriver: AddDriverRequest = {
    patronim: '',
    telephone: '',
    email: '',
    motDePasse: '',
    zoneCouverture: '',
  };

  editDriver: any = {
    id: 0,
    patronim: '',
    telephone: '',
    email: '',
    zoneCouverture: '',
    status: 'available',
  };

  constructor(
    private driverService: DriverService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.currentUser = this.auth.getCurrentUser();
    if (!this.auth.isLoggedIn()) {
      this.router.navigateByUrl('/login');
      return;
    }

    const user = this.auth.getCurrentUser();
    if (user?.role !== 'company') {
      this.router.navigateByUrl('/home');
      return;
    }
    // Charger les données immédiatement - comme le Livreur Dashboard
    this.loadDrivers();

    // Écouter NavigationEnd pour recharger lors des navigations
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        if (event.url.includes('/livreurs')) {
          this.loadDrivers();
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDrivers() {
    this.loading = true;
    this.error = '';
    this.driverService.getAllDrivers().subscribe({
      next: (response: DriverResponse) => {
        console.log('🚚 Drivers received:', response);
        if (response.success && response.drivers) {
          this.drivers = response.drivers;
        } else {
          this.drivers = [];
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Error loading drivers:', err);
        this.error = 'Error loading drivers';
        this.drivers = [];
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  get filteredDrivers() {
    if (!this.searchTerm) return this.drivers;

    const searchLower = this.searchTerm.toLowerCase();
    return this.drivers.filter(
      (driver) =>
        driver.patronim.toLowerCase().includes(searchLower) ||
        driver.phone_number.includes(this.searchTerm) ||
        driver.email.toLowerCase().includes(searchLower)
    );
  }

  // ADD MODAL
  openAddModal() {
    this.showAddModal = true;
    this.error = '';
  }

  closeAddModal() {
    this.showAddModal = false;
    this.resetForm();
    this.error = '';
  }

  addDriver() {
    if (
      !this.newDriver.patronim ||
      !this.newDriver.telephone ||
      !this.newDriver.email ||
      !this.newDriver.motDePasse
    ) {
      this.error = 'All required fields must be filled';
      return;
    }

    this.loading = true;
    this.error = '';

    this.driverService.addDriver(this.newDriver).subscribe({
      next: (response) => {
        console.log('✅ Driver added:', response);
        if (response.success) {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Driver added successfully!',
            timer: 2000,
            showConfirmButton: false,
          });
          this.loadDrivers();
          this.closeAddModal();
        }
        this.loading = false;
        this.showErrorAlert = false;
      },
      error: (err) => {
        console.error('❌ Error adding driver:', err);
        this.error = (err.error && err.error.error) ? err.error.error : (err.error || 'Error adding driver');
        this.loading = false;
        this.showErrorAlert = true;
        // Manually trigger change detection because the app runs in zoneless mode
        try { this.cdr.detectChanges(); } catch (e) { /* ignore */ }
        // auto-dismiss after 3.5s
        try { if (this.errorTimeout) { clearTimeout(this.errorTimeout); this.errorTimeout = null; } } catch(e) {}
        this.errorTimeout = setTimeout(() => {
          this.closeErrorAlert();
          this.errorTimeout = null;
        }, 3500);
      },
    });
  }

  closeErrorAlert() {
    // clear any pending timeout
    try { if (this.errorTimeout) { clearTimeout(this.errorTimeout); this.errorTimeout = null; } } catch(e) {}
    this.showErrorAlert = false;
    this.error = '';
    try { this.cdr.detectChanges(); } catch (e) { /* ignore */ }
  }

  resetForm() {
    this.newDriver = {
      patronim: '',
      telephone: '',
      email: '',
      motDePasse: '',
      zoneCouverture: '',
    };
  }

  // DETAILS MODAL
  viewDetails(driver: Driver) {
    this.driverService.getDriverById(driver.id).subscribe({
      next: (response) => {
        if (response.success && response.driver) {
          this.selectedDriver = response.driver;
          this.showDetailsModal = true;
        }
      },
      error: (err) => {
        console.error('Error loading details:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error loading details',
        });
      },
    });
  }

  closeDetailsModal() {
    this.showDetailsModal = false;
    this.selectedDriver = null;
  }

  // EDIT MODAL
  modifyDriver(driver: Driver) {
    this.driverService.getDriverById(driver.id).subscribe({
      next: (response) => {
        if (response.success && response.driver) {
          const d = response.driver;
          this.editDriver = {
            id: d.id,
            patronim: d.patronim,
            telephone: d.phone_number,
            email: d.email,
            zoneCouverture: d.zone_couverture,
            status: d.status,
          };
          this.showEditModal = true;
        }
      },
      error: (err) => {
        console.error('Error loading driver:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error loading data',
        });
      },
    });
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editDriver = {
      id: 0,
      patronim: '',
      telephone: '',
      email: '',
      zoneCouverture: '',
      status: 'available',
    };
  }

  saveEdit() {
    this.loading = true;

    this.driverService
      .updateDriver(this.editDriver.id, {
        patronim: this.editDriver.patronim,
        telephone: this.editDriver.telephone,
        email: this.editDriver.email,
        zoneCouverture: this.editDriver.zoneCouverture,
        status: this.editDriver.status,
      })
      .subscribe({
        next: (response) => {
          if (response.success) {
            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: 'Driver updated successfully!',
              timer: 2000,
              showConfirmButton: false,
            });
            this.loadDrivers();
            this.closeEditModal();
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('Error updating:', err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error updating driver',
          });
          this.loading = false;
        },
      });
  }

  // DELETE
  deleteDriver(driver: Driver) {
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you really want to delete ${driver.patronim}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;

        this.driverService.deleteDriver(driver.id).subscribe({
          next: (response) => {
            if (response.success) {
              Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: 'Driver deleted successfully!',
                timer: 2000,
                showConfirmButton: false,
              });
              this.loadDrivers();
            }
            this.loading = false;
          },
          error: (err) => {
            console.error('❌ Error deleting driver:', err);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Error deleting driver',
            });
            this.loading = false;
          },
        });
      }
    });
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      available: 'status-disponible',
      busy: 'status-occupe',
      suspended: 'status-inactif',
      offline: 'status-inactif',
    };
    return statusMap[status?.toLowerCase()] || '';
  }

  getStatusLabel(status: string): string {
    const labelMap: { [key: string]: string } = {
      available: 'Available',
      busy: 'Busy',
      suspended: 'Suspended',
      offline: 'Offline',
    };
    return labelMap[status?.toLowerCase()] || status || 'Unknown';
  }
}
