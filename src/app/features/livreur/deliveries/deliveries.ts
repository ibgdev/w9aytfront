import { Component, OnInit, OnDestroy, signal, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  DeliveriesService,
  Delivery,
  DeliveryResponse,
} from '../../../core/services/deliveries.service';
import { ChatService } from '../../../core/services/chat.service';
import { SidebarComponent } from '../sidebar/sidebar';
import Swal from 'sweetalert2';
import { AuthService } from '../../../core/services/auth.service';
import { interval, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-deliveries',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './deliveries.html',
  styleUrls: ['./deliveries.scss'],
})
export class DeliveriesComponent implements OnInit, OnDestroy {
  deliveries = signal<Delivery[]>([]);
  loading = signal(true);
  error = signal('');
  driverName = signal('');

  private destroy$ = new Subject<void>();

  constructor(
    private deliveriesService: DeliveriesService,
    private authService: AuthService,
    private chatService: ChatService,
    private router: Router,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();

    if (!this.authService.isLoggedIn()) {
      this.router.navigateByUrl('/login');
      return;
    }

    if (user?.role !== 'driver') {
      this.router.navigateByUrl('/home');
      return;
    }
    this.driverName.set(user?.name || 'Driver');

    this.fetchDeliveries();

    interval(5000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.fetchDeliveries();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getInitials(): string {
    const name = this.driverName() || '';
    const words = name.trim().split(' ');

    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }

    return words[0].charAt(0).toUpperCase() + words[1].charAt(0).toUpperCase();
  }

  fetchDeliveries(): void {
    this.loading.set(true);
    this.error.set('');

    this.deliveriesService.getDriverDeliveries('pending').subscribe({
      next: (res: DeliveryResponse) => {
        this.deliveries.set(res.data);
        this.loading.set(false);
      },
      error: (err: any) => {
        this.error.set(err?.message || 'Erreur lors du chargement');
        this.loading.set(false);
      },
    });
  }

  markDelivered(delivery: Delivery, event?: Event) {
    const checkbox = event?.target as HTMLInputElement;

    Swal.fire({
      title: 'Mark as Delivered?',
      text: `Do you want to mark delivery #${delivery.id} as delivered?`,
      imageUrl: '/favicon.ico',
      imageWidth: 80,
      imageHeight: 80,
      imageAlt: 'Confirm icon',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delivered!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.deliveriesService.markAsDelivered(delivery.id).subscribe(() => {
          this.deliveries.update((ds) => ds.filter((d) => d.id !== delivery.id));

          Swal.fire({
            position: 'top-end',
            imageUrl: '/favicon.ico',
            imageWidth: 60,
            imageHeight: 60,
            imageAlt: 'Delivered icon',
            title: 'Order has been delivered',
            timer: 2500,
            toast: true,
            timerProgressBar: true,
          });
        });
      } else {
        if (checkbox) checkbox.checked = false;
      }
    });
  }

  markReturned(delivery: Delivery) {
    Swal.fire({
      title: 'Mark as Returned?',
      text: `Do you want to mark delivery #${delivery.id} as returned?`,
      imageUrl: '/favicon.ico',
      imageWidth: 80,
      imageHeight: 80,
      imageAlt: 'Confirm icon',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, returned!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.deliveriesService.markAsReturned(delivery.id).subscribe(() => {
          this.deliveries.update((ds) => ds.filter((d) => d.id !== delivery.id));

          Swal.fire({
            position: 'top-end',
            imageUrl: '/favicon.ico',
            imageWidth: 60,
            imageHeight: 60,
            imageAlt: 'Returned icon',
            title: 'Order has been returned',
            timer: 2500,
            toast: true,
            timerProgressBar: true,
          });
        });
      }
    });
  }

  openChat(delivery: Delivery) {
    if (!delivery || !delivery.id) return;
    if (!delivery.client_id) {
      Swal.fire({
        icon: 'info',
        title: 'No Client',
        text: 'This delivery does not have a client assigned.',
        confirmButtonText: 'OK',
      });
      return;
    }

    // Créer ou récupérer la conversation
    this.chatService.createOrGetConversation(delivery.id).subscribe({
      next: (res: any) => {
        if (res.success && res.conversation) {
          this.router.navigate(['/livreur/chat', res.conversation.id]);
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to create conversation. Please try again.',
            confirmButtonText: 'OK',
          });
        }
      },
      error: (err: any) => {
        console.error('Error creating conversation:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err?.error?.message || 'Failed to open chat. Please try again.',
          confirmButtonText: 'OK',
        });
      },
    });
  }
}
