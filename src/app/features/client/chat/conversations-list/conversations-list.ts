import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ChatService } from '../../../../core/services/chat.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Navbar } from '../../../../navbar/navbar';
import { Footer } from '../../../../footer/footer';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-conversations-list',
  imports: [CommonModule, RouterModule, Navbar, Footer],
  templateUrl: './conversations-list.html',
  styleUrl: './conversations-list.scss',
})
export class ConversationsList implements OnInit, OnDestroy {
  conversations: any[] = [];
  isLoading: boolean = false;
  private subscriptions: Subscription[] = [];

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.chatService.initializeSocket();
    this.loadConversations();

    // Écouter les notifications de nouveaux messages
    const notificationSub = this.chatService.onNewMessageNotification().subscribe((data: any) => {
      this.loadConversations();
    });
    this.subscriptions.push(notificationSub);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadConversations() {
    this.isLoading = true;
    this.chatService.getUserConversations().subscribe({
      next: (res: any) => {
        this.conversations = res.conversations || [];
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        console.error('Error loading conversations:', err);
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  openConversation(conversationId: number) {
    this.router.navigate(['/chat', conversationId]);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  }
}

