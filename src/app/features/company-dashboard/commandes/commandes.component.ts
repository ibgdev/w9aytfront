import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { DeliveryService, Delivery, DeliveryResponse, Client, Driver, AddDeliveryRequest, DriversResponse  } from '../../../core/services/company/delivery.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-commandes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './commandes.component.html',
  styleUrls: ['./commandes.component.scss']
})
export class CommandesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  deliveries: Delivery[] = [];
  clients: Client[] = [];
  drivers: Driver[] = [];
  searchTerm: string = '';
  statusFilter: string = 'all';
  showAddModal: boolean = false;
  showEditModal: boolean = false;
  showDetailsModal: boolean = false;
  loading: boolean = false;
  error: string = '';
  selectedDelivery: any = null;

  newDelivery: AddDeliveryRequest = {
    client_id: 0,
    pickup_address: '',
    dropoff_address: '',
    receiver_name: '',
    receiver_phone: '',
    weight: 0,
    size: 'M',
    price: 0,
    payment_method: 'cash',
    payment_amount: 0
  };

  editDelivery: any = {
    id: 0,
    status: 'pending',
    driver_id: null
  };

  constructor(
    private deliveryService: DeliveryService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Charger les données immédiatement - comme le Livreur Dashboard
    this.loadAllData();

    // Écouter NavigationEnd pour recharger lors des navigations
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        if (event.url.includes('/commandes')) {
          this.loadAllData();
        }
      });
  }

  private loadAllData() {
    this.loadDeliveries();
    this.loadClients();
    this.loadDrivers();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDeliveries() {
    this.loading = true;
    this.error = '';
    this.deliveryService.getAllDeliveries().subscribe({
      next: (response: DeliveryResponse) => {
        if (response.success && response.deliveries) {
          this.deliveries = response.deliveries;
        } else {
          this.deliveries = [];
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Error loading deliveries:', err);
        this.error = 'Error loading orders';
        this.deliveries = [];
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadClients() {
    this.deliveryService.getClients().subscribe({
      next: (response) => {
        if (response.success && response.clients) {
          this.clients = response.clients;
        }
      },
      error: (err) => {
        console.error('❌ Error loading clients:', err);
      }
    });
  }

  loadDrivers() {
    this.deliveryService.getDrivers().subscribe({
      next: (response: DriversResponse) => {
        if (response.success && response.drivers) {
          this.drivers = response.drivers;
        }
      },
      error: (err: any) => {
        console.error('❌ Error loading drivers:', err);
      }
    });
  }

  get filteredDeliveries() {
    let filtered = this.deliveries;

    if (this.searchTerm && this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(d =>
        (d.id && d.id.toLowerCase().includes(searchLower)) ||
        (d.client && d.client.toLowerCase().includes(searchLower)) ||
        (d.receiver_phone && d.receiver_phone.includes(this.searchTerm.trim())) ||
        (d.adresse_livraison && d.adresse_livraison.toLowerCase().includes(searchLower)) ||
        (d.livreur_assigne && d.livreur_assigne.toLowerCase().includes(searchLower)) ||
        (d.price && d.price.toString().includes(this.searchTerm.trim()))
      );
    }

    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(d => d.statut === this.statusFilter);
    }

    return filtered;
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

  addDelivery() {
    if (!this.newDelivery.client_id || this.newDelivery.client_id === 0) {
      this.error = 'Please select a client';
      return;
    }

    if (!this.newDelivery.dropoff_address || !this.newDelivery.receiver_name || 
        !this.newDelivery.receiver_phone) {
      this.error = 'Required fields must be filled';
      return;
    }

    this.loading = true;
    this.error = '';

    if (!this.newDelivery.payment_amount) {
      this.newDelivery.payment_amount = this.newDelivery.price;
    }

    this.deliveryService.createDelivery(this.newDelivery).subscribe({
      next: (response) => {
        if (response.success) {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Order created successfully!',
            timer: 2000,
            showConfirmButton: false
          });
          this.loadDeliveries();
          this.closeAddModal();
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Error creating delivery:', err);
        this.error = err.error || 'Error creating order';
        this.loading = false;
      }
    });
  }

  resetForm() {
    this.newDelivery = {
      client_id: 0,
      pickup_address: '',
      dropoff_address: '',
      receiver_name: '',
      receiver_phone: '',
      weight: 0,
      size: 'M',
      price: 0,
      payment_method: 'cash',
      payment_amount: 0
    };
  }

  // DETAILS MODAL
  viewDetails(delivery: Delivery) {
    const deliveryId = parseInt(delivery.id.replace('#', ''));
    
    this.deliveryService.getDeliveryById(deliveryId).subscribe({
      next: (response) => {
        if (response.success && response.delivery) {
          this.selectedDelivery = response.delivery;
          this.showDetailsModal = true;
        }
      },
      error: (err) => {
        console.error('Error loading details:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error loading details'
        });
      }
    });
  }

  closeDetailsModal() {
    this.showDetailsModal = false;
    this.selectedDelivery = null;
  }

  // EDIT MODAL
  modifyDelivery(delivery: Delivery) {
    const deliveryId = parseInt(delivery.id.replace('#', ''));
    
    this.deliveryService.getDeliveryById(deliveryId).subscribe({
      next: (response: any) => {
        if (response.success && response.delivery) {
          const d = response.delivery;
          this.editDelivery = {
            id: d.id,
            status: d.status,
            driver_id: d.driver_id
          };
          this.showEditModal = true;
        }
      },
      error: (err: any) => {
        console.error('Error loading delivery:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error loading data'
        });
      }
    });
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editDelivery = { id: 0, status: 'pending', driver_id: null };
  }

  saveEdit() {
    this.loading = true;
    
    this.deliveryService.updateDelivery(this.editDelivery.id, {
      status: this.editDelivery.status,
      driver_id: this.editDelivery.driver_id
    }).subscribe({
      next: (response) => {
        if (response.success) {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Order updated successfully!',
            timer: 2000,
            showConfirmButton: false
          });
          this.loadDeliveries();
          this.closeEditModal();
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error updating:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error updating order'
        });
        this.loading = false;
      }
    });
  }

  // DELETE
  deleteDelivery(delivery: Delivery) {
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you really want to delete order ${delivery.id}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
        const deliveryId = parseInt(delivery.id.replace('#', ''));
        
        this.deliveryService.deleteDelivery(deliveryId).subscribe({
          next: (response) => {
            if (response.success) {
              Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: 'Order deleted successfully!',
                timer: 2000,
                showConfirmButton: false
              });
              this.loadDeliveries();
            }
            this.loading = false;
          },
          error: (err) => {
            console.error('Error deleting:', err);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Error deleting order'
            });
            this.loading = false;
          }
        });
      }
    });
  }

  getStatusClass(statut: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'status-attente',
      'accepted': 'status-acceptee',
      'in_transit': 'status-encours',
      'delivered': 'status-livree',
      'cancelled': 'status-annulee',
      'returned': 'status-retournee'
    };
    return statusMap[statut] || '';
  }

  getStatusLabel(statut: string): string {
    const labelMap: { [key: string]: string } = {
      'pending': 'Pending',
      'accepted': 'Accepted',
      'in_transit': 'In Transit',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled',
      'returned': 'Returned'
    };
    return labelMap[statut] || statut;
  }

  onSearch() {
    // La recherche se fait automatiquement via le getter filteredDeliveries
    // Cette méthode peut être utilisée pour des actions supplémentaires si nécessaire
  }

  clearSearch() {
    this.searchTerm = '';
  }
}
