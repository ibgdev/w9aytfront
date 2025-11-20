import { Component, OnInit, ChangeDetectorRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ContactService, Contact } from '../../../core/services/contact.service';
import { SidebarComponent } from '../sidebar/sidebar.component/sidebar.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-contact-messages',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './contact-messages.component.html',
  styleUrls: ['./contact-messages.component.scss']
})
export class ContactMessagesComponent implements OnInit {
  
  contacts: Contact[] = [];
  filteredContacts: Contact[] = [];
  searchTerm: string = '';
  isLoading = false;
  showDeleteConfirm = false;
  selectedContact: Contact | null = null;
  
  // Alert system
  alertMessage = signal('');
  alertType = signal<'success' | 'error' | 'warning' | ''>('');
  
  private auth = inject(AuthService);
  private router = inject(Router);

  constructor(
    private contactService: ContactService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Check if user is logged in
    if (!this.auth.isLoggedIn()) {
      this.router.navigateByUrl('/login');
      return;
    }

    // Check if user is admin
    const user = this.auth.getCurrentUser();
    if (user?.role !== 'admin') {
      this.router.navigateByUrl('/home');
      return;
    }

    this.loadContacts();
  }

  loadContacts(): void {
    this.isLoading = true;
    this.cdr.detectChanges();
    
    this.contactService.getAllContacts().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.contacts = response.data;
          this.filteredContacts = [...this.contacts];
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error('Error loading contacts:', error);
        this.showAlert('Error loading contact messages', 'error');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  filterContacts(): void {
    const search = this.searchTerm.toLowerCase().trim();
    
    if (!search) {
      this.filteredContacts = [...this.contacts];
    } else {
      this.filteredContacts = this.contacts.filter(contact => {
        const matchName = contact.fullname?.toLowerCase().includes(search);
        const matchEmail = contact.email?.toLowerCase().includes(search);
        const matchPhone = contact.tell?.toLowerCase().includes(search);
        return matchName || matchEmail || matchPhone;
      });
    }
    this.cdr.detectChanges();
  }

  openDeleteConfirm(contact: Contact): void {
    this.selectedContact = contact;
    this.showDeleteConfirm = true;
    this.cdr.detectChanges();
  }

  closeDeleteConfirm(): void {
    this.selectedContact = null;
    this.showDeleteConfirm = false;
    this.cdr.detectChanges();
  }

  deleteContact(): void {
    if (!this.selectedContact || !this.selectedContact.id) return;

    this.isLoading = true;
    this.cdr.detectChanges();

    this.contactService.deleteContact(this.selectedContact.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.showAlert('Contact message deleted successfully', 'success');
          this.closeDeleteConfirm();
          this.loadContacts();
        } else {
          this.isLoading = false;
          this.showAlert('Error deleting contact message', 'error');
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error('Error deleting contact:', error);
        this.isLoading = false;
        this.showAlert('Error deleting contact message', 'error');
        this.cdr.detectChanges();
      }
    });
  }

  // Show alert message
  showAlert(message: string, type: 'success' | 'error' | 'warning'): void {
    this.alertMessage.set(message);
    this.alertType.set(type);
    this.cdr.detectChanges();
    setTimeout(() => {
      this.alertMessage.set('');
      this.alertType.set('');
      this.cdr.detectChanges();
    }, 5000);
  }
}
