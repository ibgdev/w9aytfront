import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { SidebarComponent } from '../sidebar/sidebar.component/sidebar.component';
import { UserService, User } from '../../../core/services/user.service';

interface Utilisateur {
  id?: number;
  prenom: string;
  nom: string;
  contact: string;
  department: string;
  adminRole: string;
    roleValue?: string; // ✅ Add this for the actual API value

  dateCreation: string;
  disponibilite: number;
  securite: number;
  phone?: string;
  address?: string;
  status?: string;
  verified?: number;
}

@Component({
  selector: 'app-gestion-utilisateurs',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HttpClientModule],
  templateUrl: './gestion-utilisateurs.component.html',
  styleUrls: ['./gestion-utilisateurs.component.scss'],
  providers: [UserService]
})
export class GestionUtilisateurs implements OnInit, OnDestroy {
  // Loading state
  isLoading = false;
  
  // Alert messages
  alertMessage = '';
  alertType: 'success' | 'error' | 'warning' | '' = '';
  
  // Statistiques
  administrateurs = 0;
  clients = 0;
  companies = 0;
  drivers = 0;
  totalUtilisateurs = 0;

  // Liste des utilisateurs
  utilisateurs: Utilisateur[] = [];

  // Modals
  showNouvelUtilisateur = false;
  showModifierUtilisateur = false;
  showConfirmDelete = false;
  selectedUser: Utilisateur | null = null;

  // Formulaire
  newUser = {
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    adresse: '',
    department: '',
    role: '',
    status: '',
    password: ''
  };

  // Router subscription
  private routerSubscription?: Subscription;

  constructor(
    private userService: UserService,
    private router: Router,
    private cdr: ChangeDetectorRef // ✅ Add ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('GestionUtilisateurs ngOnInit called');
    this.loadUsers();
    
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        console.log('Navigation to:', event.url);
        if (event.url.includes('/admin/gestion-utilisateurs')) {
          this.loadUsers();
        }
      });
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  // Show alert message
  showAlert(message: string, type: 'success' | 'error' | 'warning'): void {
    this.alertMessage = message;
    this.alertType = type;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.alertMessage = '';
      this.alertType = '';
      this.cdr.detectChanges();
    }, 5000);
  }

  // Charger tous les utilisateurs
  loadUsers(): void {
    this.isLoading = true;
    this.cdr.detectChanges(); // ✅ Force change detection
    
    console.log('Loading users...');
    
    this.userService.getAllUsers().subscribe({
      next: (users: User[]) => {
        console.log('Users received:', users);
        this.utilisateurs = users.map(user => this.transformUser(user));
        this.calculateStats();
        this.isLoading = false;
        this.cdr.detectChanges(); // ✅ Force change detection
        console.log('Users loaded:', this.utilisateurs);
      },
      error: (error: any) => {
        console.error('Error loading users:', error);
        this.isLoading = false;
        this.cdr.detectChanges();
        this.showAlert('Error loading users', 'error');
      }
    });
  }

  // Transformation pour l'affichage
 transformUser(user: User): Utilisateur {
  const nameParts = user.name?.split(' ') || ['', ''];
  
  // Map all roles correctly
  let displayRole = 'User';
  switch(user.role) {
    case 'admin':
      displayRole = 'Administrator';
      break;
    case 'client':
      displayRole = 'Client';
      break;
    case 'driver':
      displayRole = 'Driver';
      break;
    case 'company':
      displayRole = 'Company';
      break;
    default:
      displayRole = 'User';
  }
  
  return {
    id: user.id,
    prenom: nameParts[0] || '',
    nom: nameParts.slice(1).join(' ') || '',
    contact: user.email || '',
    department: user.address || 'Non défini',
    adminRole: displayRole,
    roleValue: user.role, // ✅ Store the actual API value
    dateCreation: user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR'),
    disponibilite: Math.floor(Math.random() * 40) + 60,
    securite: Math.floor(Math.random() * 30) + 70,
    phone: user.phone,
    address: user.address,
    status: user.status,
    verified: user.verified
  };
}

  // Calcul statistiques
  calculateStats(): void {
    this.totalUtilisateurs = this.utilisateurs.length;
    this.administrateurs = this.utilisateurs.filter(u => u.adminRole === 'Administrator').length;
    this.clients = this.utilisateurs.filter(u => u.adminRole === 'Client').length;
    this.companies = this.utilisateurs.filter(u => u.adminRole === 'Company').length;
    this.drivers = this.utilisateurs.filter(u => u.adminRole === 'Driver').length;
    this.cdr.detectChanges();
  }

  // --- Ouvrir / Fermer modals ---
  openNouvelUtilisateur(): void { 
    this.showNouvelUtilisateur = true;
    this.cdr.detectChanges(); // ✅ Force change detection
  }
  
  closeNouvelUtilisateur(): void { 
    this.showNouvelUtilisateur = false; 
    this.resetForm();
    this.cdr.detectChanges(); // ✅ Force change detection
  }

  openModifierUtilisateur(user: Utilisateur): void { 
    this.selectedUser = { ...user }; 
    this.showModifierUtilisateur = true;
    this.cdr.detectChanges(); // ✅ Force change detection
  }
  
  closeModifierUtilisateur(): void { 
    this.selectedUser = null; 
    this.showModifierUtilisateur = false;
    this.cdr.detectChanges(); // ✅ Force change detection
  }

  openConfirmDelete(user: Utilisateur): void { 
    this.selectedUser = { ...user }; 
    this.showConfirmDelete = true;
    this.cdr.detectChanges(); // ✅ Force change detection
  }
  
  closeConfirmDelete(): void { 
    this.selectedUser = null; 
    this.showConfirmDelete = false;
    this.cdr.detectChanges(); // ✅ Force change detection
  }

  // --- Actions utilisateur ---
  creerUtilisateur(): void {
    if (!this.newUser.prenom || !this.newUser.nom || !this.newUser.email || !this.newUser.password) {
      this.showAlert('Please fill in all required fields', 'warning');
      return;
    }
    if (this.newUser.password.length < 8) {
      this.showAlert('Password must be at least 8 characters', 'warning');
      return;
    }
    const phoneRegex = /^\d{8}$/;
    if (!phoneRegex.test(this.newUser.telephone)) {
      this.showAlert('Invalid phone number', 'warning');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.newUser.email)) {
      this.showAlert('Invalid email address', 'warning');
      return;
    }

    const userData: User = {
      name: `${this.newUser.prenom} ${this.newUser.nom}`,
      email: this.newUser.email,
      phone: this.newUser.telephone,
      password: this.newUser.password,
      role: this.newUser.role || 'user',
      address: this.newUser.adresse || '',
      status: this.newUser.status || 'active',
      verified: 0
    };

    this.userService.createUser(userData).subscribe({
      next: () => {
        this.showAlert('User created successfully', 'success');
        this.loadUsers();
        this.closeNouvelUtilisateur();
      },
      error: err => {
        console.error('Error:', err);
        const errorMessage = err.error?.message || err.error?.error || err.message || 'Unknown error';
        this.showAlert('Error creating user: ' + errorMessage, 'error');
      }
    });
  }

  modifierUtilisateur(): void {
  if (!this.selectedUser || !this.selectedUser.id) return;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(this.selectedUser.contact)) {
    this.showAlert('Invalid email address', 'warning');
    return;
  }
  const phoneRegex = /^\d{8}$/;
  if (this.selectedUser.phone && !phoneRegex.test(this.selectedUser.phone)) {
    this.showAlert('Invalid phone number', 'warning');
    return;
  }

  const userData: Partial<User> = {
    name: `${this.selectedUser.prenom} ${this.selectedUser.nom}`,
    email: this.selectedUser.contact,
    role: this.selectedUser.roleValue,
    address: this.selectedUser.address || this.selectedUser.department,
    phone: this.selectedUser.phone || '',
    status: this.selectedUser.status || 'active'
  };

  this.userService.updateUser(this.selectedUser.id, userData).subscribe({
    next: () => {
      this.showAlert('User updated successfully', 'success');
      this.loadUsers();
      this.closeModifierUtilisateur();
    },
    error: err => {
      console.error('Error:', err);
      const errorMessage = err.error?.message || err.error?.error || err.message || 'Unknown error';
      this.showAlert('Error updating user: ' + errorMessage, 'error');
    }
  });
}

  supprimerUtilisateur(): void {
    if (!this.selectedUser || !this.selectedUser.id) return;

    this.userService.deleteUser(this.selectedUser.id).subscribe({
      next: () => {
        this.showAlert('User deleted successfully', 'success');
        this.loadUsers();
        this.closeConfirmDelete();
      },
      error: err => {
        console.error('Error:', err);
        const errorMessage = err.error?.message || err.error?.error || err.message || 'Unknown error';
        this.showAlert('Error deleting user: ' + errorMessage, 'error');
      }
    });
  }

  // --- Reset form ---
  resetForm(): void {
    this.newUser = {
      prenom: '',
      nom: '',
      email: '',
      telephone: '',
      adresse: '',
      department: '',
      role: '',
      status: '',
      password: ''
    };
  }

  // --- Barre de progression (optionnelle) ---
  getProgressColor(value: number): string {
    if (value >= 80) return '#4CAF50';
    if (value >= 50) return '#FF9800';
    return '#F44336';
  }
}