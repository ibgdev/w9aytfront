import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import Swal from 'sweetalert2';
import { DeliveryService } from '../../../../core/services/delivery.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Navbar } from '../../../../navbar/navbar';
import { Footer } from '../../../../footer/footer';
import { ContactUs } from '../../../../home/contact-us/contact-us';
import { AuthService } from '../../../../core/services/auth.service';
import { ChatService } from '../../../../core/services/chat.service';


@Component({
  selector: 'app-history',
  imports: [CommonModule, FormsModule, RouterModule, Navbar, Footer],
  templateUrl: './history.html',
  styleUrl: './history.scss',
})
export class History implements OnInit {
  deliveries: any[] = [];
  filteredDeliveries: any[] = [];
  searchTerm: string = '';
  selectedStatus: string = '';
  currentPage: number = 1;
  pageSize: number = 3;
  totalPages: number = 1;
  totalDeliveries: number = 0;
  isLoading: boolean = false;
    private auth = inject(AuthService);

  constructor(
    private deliveryService: DeliveryService,
    private authService: AuthService,
    private chatService: ChatService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
  this.fetchDeliveries();
      if (!this.auth.isLoggedIn()) {
      this.router.navigateByUrl('/login');
      return;
    }

    // Check if user is admin
    const user = this.auth.getCurrentUser();
    if (user?.role !== 'client') {
      this.router.navigateByUrl('/home');
      return;

  }
  }

  fetchDeliveries(params?: any) {
    this.isLoading = true;
    const currentUser = this.authService.getCurrentUser();
    const queryParams = { ...params, page: this.currentPage, pageSize: this.pageSize };
    if (currentUser && currentUser.id) {
      queryParams.client_id = currentUser.id;
    }
    this.deliveryService.getDeliveryHistory(queryParams).subscribe({
      next: (res: any) => {
        this.deliveries = res.data || [];
        this.totalDeliveries = res.total || 0;
        this.totalPages = Math.max(1, Math.ceil(this.totalDeliveries / this.pageSize));
        this.filteredDeliveries = this.deliveries;
        this.isLoading = false;
        // Zoneless change detection: manually mark for check so the view updates on first click/HTTP response
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        console.error('Failed to fetch deliveries', err);
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  onSearchChange() {
  // call backend as user types (simple behavior). For large data, consider debouncing.
  const q = this.searchTerm?.trim();
  this.currentPage = 1;
  this.fetchDeliveries(q ? { q, status: this.selectedStatus } : (this.selectedStatus ? { status: this.selectedStatus } : undefined));
  }

  applyFilters() {
  const params: any = {};
  if (this.searchTerm?.trim()) params.q = this.searchTerm.trim();
  if (this.selectedStatus) params.status = this.selectedStatus;
  this.currentPage = 1;
  params._refresh = Date.now(); // Ajout pour forcer le refresh
  this.fetchDeliveries(Object.keys(params).length ? params : undefined);
  }

  clearFilters() {
  this.searchTerm = '';
  this.selectedStatus = '';
  this.currentPage = 1;
  this.fetchDeliveries();
  }

  formatStatus(status: string) {
    if (!status && status !== '') return '';
    const map: any = {
      pending: 'Pending',
      assigned: 'Assigned',
      in_transit: 'In transit',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      canceled: 'Canceled'
    };
    if (map[status]) return map[status];
    // fallback: replace underscores, capitalize words
    return status.split(/[_\s]+/).map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  cancelOrder(delivery: any) {
    if (!delivery || !delivery.id) return;
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to cancel this order?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, cancel',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.isConfirmed) {
        this.deliveryService.cancelDelivery(delivery.id).subscribe({
          next: (res: any) => {
            delivery.status = 'cancelled';
            this.applyFilterAndPagination();
            Swal.fire('Cancelled!', 'The order has been cancelled successfully.', 'success');
            // Ensure UI reflects the updated status immediately in zoneless mode
            this.cdr.markForCheck();
          },
          error: (err: any) => {
            console.error('Cancel order failed', err);
            Swal.fire('Error', 'Failed to cancel the order.', 'error');
          }
        });
      }
    });
  }

  applyFilterAndPagination() {
  // plus utilisé, pagination côté backend
  }

  goToPage(page: number) {
  if (page < 1 || page > this.totalPages) return;
  this.currentPage = page;
  this.fetchDeliveries({ q: this.searchTerm?.trim(), status: this.selectedStatus });
  }

  openChat(delivery: any) {
    if (!delivery || !delivery.id) return;
    if (!delivery.driver_name) {
      Swal.fire('No Driver', 'This delivery does not have an assigned driver yet.', 'info');
      return;
    }

    // Créer ou récupérer la conversation
    this.chatService.createOrGetConversation(delivery.id).subscribe({
      next: (res: any) => {
        if (res.success && res.conversation) {
          this.router.navigate(['/chat', res.conversation.id]);
        }
      },
      error: (err: any) => {
        console.error('Error creating conversation:', err);
        Swal.fire('Error', 'Failed to open chat. Please try again.', 'error');
      }
    });
  }
}
