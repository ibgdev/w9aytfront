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
  
  // Statistiques
  utilisateursActifs = 0;
  administrateurs = 0;
  enAttente = 0;
  totalUtilisateurs = 0;
  utilisateursNormaux = 0;

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
        console.error('Erreur lors du chargement des utilisateurs:', error);
        this.isLoading = false;
        this.cdr.detectChanges(); // ✅ Force change detection
        alert('Erreur lors du chargement des utilisateurs.');
      }
    });
  }

  // Transformation pour l'affichage
 transformUser(user: User): Utilisateur {
  const nameParts = user.name?.split(' ') || ['', ''];
  
  // Map all roles correctly
  let displayRole = 'Utilisateur';
  switch(user.role) {
    case 'admin':
      displayRole = 'Administrateur';
      break;
    case 'client':
      displayRole = 'Client';
      break;
    case 'driver':
      displayRole = 'Chauffeur';
      break;
    case 'company':
      displayRole = 'Entreprise';
      break;
    default:
      displayRole = 'Utilisateur';
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
    status: user.status
  };
}

  // Calcul statistiques
  calculateStats(): void {
    this.totalUtilisateurs = this.utilisateurs.length;
    this.utilisateursActifs = this.utilisateurs.filter(u => u.status === 'active').length;
    this.enAttente = this.utilisateurs.filter(u => u.status === 'suspended').length;
    this.administrateurs = this.utilisateurs.filter(u => u.adminRole === 'Administrateur').length;
    this.utilisateursNormaux = this.utilisateurs.filter(u => u.adminRole === 'Utilisateur').length;
    this.cdr.detectChanges(); // ✅ Force change detection
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
      alert('Veuillez remplir tous les champs obligatoires'); 
      return;
    }
    if (this.newUser.password.length < 8) { 
      alert('Le mot de passe doit contenir au moins 8 caractères'); 
      return; 
    }
    const phoneRegex = /^\+216\d{8}$/;
    if (!phoneRegex.test(this.newUser.telephone)) { 
      alert('Téléphone invalide. Format attendu: +216XXXXXXXX'); 
      return; 
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.newUser.email)) { 
      alert('Email invalide'); 
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
        alert('Utilisateur créé avec succès');
        this.loadUsers();
        this.closeNouvelUtilisateur();
      },
      error: err => {
        console.error('Erreur complète:', err);
        const errorMessage = err.error?.message || err.error?.error || err.message || 'Erreur inconnue';
        alert('Erreur création utilisateur: ' + errorMessage);
      }
    });
  }

  modifierUtilisateur(): void {
  if (!this.selectedUser || !this.selectedUser.id) return;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(this.selectedUser.contact)) { 
    alert('Email invalide'); 
    return; 
  }
  const phoneRegex = /^\+216\d{8}$/;
  if (this.selectedUser.phone && !phoneRegex.test(this.selectedUser.phone)) { 
    alert('Téléphone invalide. Format attendu: +216XXXXXXXX'); 
    return; 
  }

  const userData: Partial<User> = {
    name: `${this.selectedUser.prenom} ${this.selectedUser.nom}`,
    email: this.selectedUser.contact,
    role: this.selectedUser.roleValue, // ✅ Use the actual API value directly
    address: this.selectedUser.address || this.selectedUser.department,
    phone: this.selectedUser.phone || '',
    status: this.selectedUser.status || 'active'
  };

  this.userService.updateUser(this.selectedUser.id, userData).subscribe({
    next: () => {
      alert('Utilisateur modifié avec succès');
      this.loadUsers();
      this.closeModifierUtilisateur();
    },
    error: err => {
      console.error('Erreur complète:', err);
      const errorMessage = err.error?.message || err.error?.error || err.message || 'Erreur inconnue';
      alert('Erreur modification utilisateur: ' + errorMessage);
    }
  });
}

  supprimerUtilisateur(): void {
    if (!this.selectedUser || !this.selectedUser.id) return;

    this.userService.deleteUser(this.selectedUser.id).subscribe({
      next: () => {
        alert('Utilisateur supprimé');
        this.loadUsers();
        this.closeConfirmDelete();
      },
      error: err => {
        console.error('Erreur complète:', err);
        const errorMessage = err.error?.message || err.error?.error || err.message || 'Erreur inconnue';
        alert('Erreur suppression utilisateur: ' + errorMessage);
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