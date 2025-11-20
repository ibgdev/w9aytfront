import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService, User } from '../../../core/services/user.service';
import { SidebarComponent } from '../sidebar/sidebar.component/sidebar.component';

@Component({
  selector: 'app-validation-demandes',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './validation-demandes.component.html',
  styleUrls: ['./validation-demandes.component.scss']
})
export class ValidationDemandesComponent implements OnInit {
  
  users: User[] = [];
  isLoading = false;

  constructor(
    private userService: UserService,
    private cdr: ChangeDetectorRef // ✅ Ajouté
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.cdr.detectChanges(); // ✅ Force change detection
    
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.isLoading = false;
        this.cdr.detectChanges(); // ✅ Force change detection
      },
      error: (error) => {
        console.error('Error:', error);
        this.isLoading = false;
        this.cdr.detectChanges(); // ✅ Force change detection
      }
    });
  }

  // Bouton Approve - change le status en "active"
  approveUser(user: User): void {
    if (!user.id) return;
    
    if (confirm(`Activer l'utilisateur ${user.name} ?`)) {
      this.userService.updateUser(user.id, { status: 'active' }).subscribe({
        next: () => {
          user.status = 'active';
          this.cdr.detectChanges(); // ✅ Force change detection
          alert('Utilisateur activé !');
        },
        error: (error) => {
          alert('Erreur !');
          console.error(error);
          this.cdr.detectChanges(); // ✅ Force change detection
        }
      });
    }
  }

  // Bouton Reject - change le status en "banned"  
  rejectUser(user: User): void {
    if (!user.id) return;
    
    if (confirm(`Bannir l'utilisateur ${user.name} ?`)) {
      this.userService.updateUser(user.id, { status: 'banned' }).subscribe({
        next: () => {
          user.status = 'banned';
          this.cdr.detectChanges(); // ✅ Force change detection
          alert('Utilisateur banni !');
        },
        error: (error) => {
          alert('Erreur !');
          console.error(error);
          this.cdr.detectChanges(); // ✅ Force change detection
        }
      });
    }
  }

  getStatusText(status: string | undefined): string {
    if (status === 'active') return 'Actif';
    if (status === 'banned') return 'Banni';
    return 'En attente';
  }
}