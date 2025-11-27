import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DeliveriesService, Delivery, DeliveryResponse } from '../../../core/services/deliveries.service';
import { ChatService } from '../../../core/services/chat.service';
import { SidebarComponent } from '../sidebar/sidebar';
import { AuthService } from '../../../core/services/auth.service';
import Swal from 'sweetalert2';
import { Subject } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-deliveryall',
  standalone: true,
  imports: [CommonModule, SidebarComponent, FormsModule],
  templateUrl: './deliveryall.html',
  styleUrls: ['./deliveryall.scss']
})
export class Deliveryall implements OnInit, OnDestroy {
  deliveries = signal<Delivery[]>([]);
  loading = signal(true);
  error = signal('');
  driverName = signal('');
  filterDate = signal<string>('');
  filterStatus = signal<string>('');

  private destroy$ = new Subject<void>();

  constructor(
    private deliveriesService: DeliveriesService,
    private authService: AuthService,
    private chatService: ChatService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.driverName.set(user?.name || 'Driver');
    this.fetchDeliveries();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchDeliveries(): void {
    this.loading.set(true);
    this.error.set('');

    // Récupérer toutes les livraisons (sans filtre de statut) avec une limite élevée
    this.deliveriesService.getDriverDeliveries('all', 1, 1000).subscribe({
      next: (res: DeliveryResponse) => {
        this.deliveries.set(res.data || []);
        this.loading.set(false);
      },
      error: (err: any) => {
        this.error.set(err?.message || 'Erreur lors du chargement');
        this.loading.set(false);
      }
    });
  }

  // === AVATAR INITIALS ===
  getInitials(): string {
    const name = this.driverName() || '';
    const words = name.trim().split(' ');

    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }

    return (
      words[0].charAt(0).toUpperCase() +
      words[1].charAt(0).toUpperCase()
    );
  }

  // === FILTERING ===
  filteredDeliveries = computed(() => {
    return this.deliveries().filter(d => {
      let matchDate = true;
      if (this.filterDate()) {
        // Utiliser updated_at ou created_at comme fallback
        const dateToUse = d.updated_at || d.created_at;
        if (!dateToUse) return false;
        
        const deliveryDate = new Date(dateToUse);
        const filter = new Date(this.filterDate());

        matchDate =
          deliveryDate.getFullYear() === filter.getFullYear() &&
          deliveryDate.getMonth() === filter.getMonth() &&
          deliveryDate.getDate() === filter.getDate();
      }

      let matchStatus = true;
      if (this.filterStatus()) {
        matchStatus = d.status.toLowerCase() === this.filterStatus().toLowerCase();
      }

      return matchDate && matchStatus;
    });
  });

  totalDeliveries() {
    return this.deliveries().length;
  }

  totalToday() {
    const now = new Date();
    const today =
      now.getDate().toString().padStart(2, '0') + '/' +
      (now.getMonth() + 1).toString().padStart(2, '0') + '/' +
      now.getFullYear();

    return this.deliveries().filter(d =>
      d.status.toLowerCase() === 'delivered' &&
      d.updated_at &&
      new Date(d.updated_at).toLocaleDateString('fr-FR') === today
    ).length;
  }

  earningsPerMonth() {
    const earningsMap: { [month: string]: number } = {};

    this.deliveries().forEach(d => {
      // Ne calculer que pour les livraisons livrées
      if (!d.status || d.status.toLowerCase() !== 'delivered') return;

      // Utiliser completed_at, updated_at ou created_at comme fallback
      const dateToUse = d.completed_at || d.updated_at || d.created_at;
      if (!dateToUse) return;

      const date = new Date(dateToUse);
      if (isNaN(date.getTime())) return;

      const month = `${date.getFullYear()}-${(date.getMonth()+1)
        .toString()
        .padStart(2,'0')}`;

      // Calculer le gain: payment_amount - price
      // Si payment_amount n'est pas disponible, utiliser price + 7 - price = 7
      const paymentAmount = Number(d.payment_amount) || 0;
      const price = Number(d.price) || 0;
      const earning = paymentAmount > 0 ? (paymentAmount - price) : 7; // Fallback à 7 si payment_amount n'est pas défini
      
      earningsMap[month] = (earningsMap[month] || 0) + earning;
    });

    // Trier par mois (du plus récent au plus ancien)
    return Object.entries(earningsMap)
      .map(([month, amount]) => ({
        month,
        amount: Number(amount.toFixed(2)) // Arrondir à 2 décimales
      }))
      .sort((a, b) => b.month.localeCompare(a.month)); // Trier par ordre décroissant
  }

  setFilterStatus(status: string) {
    this.filterStatus.set(status);
  }

  formatMonth(month: string): string {
    // Format: "2025-11" -> "November 2025"
    const [year, monthNum] = month.split('-');
    const date = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  openChat(delivery: Delivery) {
    if (!delivery || !delivery.id) return;
    if (!delivery.client_id) {
      Swal.fire({
        icon: 'info',
        title: 'No Client',
        text: 'This delivery does not have a client assigned.',
        confirmButtonText: 'OK'
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
            confirmButtonText: 'OK'
          });
        }
      },
      error: (err: any) => {
        console.error('Error creating conversation:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err?.error?.message || 'Failed to open chat. Please try again.',
          confirmButtonText: 'OK'
        });
      }
    });
  }
}
