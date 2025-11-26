import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../../core/services/chat.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Navbar } from '../../../../navbar/navbar';
import { Footer } from '../../../../footer/footer';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  imports: [CommonModule, FormsModule, RouterModule, Navbar, Footer],
  templateUrl: './chat.html',
  styleUrl: './chat.scss',
})
export class Chat implements OnInit, OnDestroy {
  @ViewChild('messagesContainer', { static: false }) messagesContainer!: ElementRef;
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;

  conversationId: number | null = null;
  conversation: any = null;
  messages: any[] = [];
  currentUser: any = null;
  newMessage: string = '';
  selectedFile: File | null = null;
  isLoading: boolean = false;
  isSending: boolean = false;
  otherUserOnline: boolean = false;
  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private chatService: ChatService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    
    // Configurer les listeners AVANT d'initialiser Socket.io
    // Écouter les nouveaux messages
    const messageSub = this.chatService.onNewMessage().subscribe((message) => {
      console.log('onNewMessage received:', message, 'current conversationId:', this.conversationId);
      if (message.conversation_id === this.conversationId) {
        // Vérifier si le message n'existe pas déjà (éviter les doublons)
        const messageExists = this.messages.some(m => m.id === message.id);
        if (!messageExists) {
          console.log('Adding new message to list');
          this.messages.push(message);
          this.scrollToBottom();
          this.cdr.markForCheck();
        } else {
          console.log('Message already exists, skipping');
        }
      } else {
        console.log('Message conversation_id mismatch:', message.conversation_id, 'vs', this.conversationId);
      }
    });
    this.subscriptions.push(messageSub);

    // Écouter les changements de statut en ligne
    const onlineStatusSub = this.chatService.onOnlineStatusChange().subscribe((data: any) => {
      console.log('onOnlineStatusChange received:', data);
      this.updateOnlineStatus(data.user_id, data.is_online);
    });
    this.subscriptions.push(onlineStatusSub);

    // Initialiser Socket.io après avoir configuré les listeners
    this.chatService.initializeSocket();

    this.route.params.subscribe(params => {
      const id = +params['id'];
      if (id && id !== this.conversationId) {
        // Quitter l'ancienne conversation si elle existe
        if (this.conversationId) {
          this.chatService.leaveConversation(this.conversationId);
        }
        
        this.conversationId = id;
        this.messages = []; // Réinitialiser les messages
        this.loadConversation();
        
        // Attendre que Socket.io soit connecté avant de rejoindre
        const checkConnection = (attempts = 0) => {
          const socket = (this.chatService as any).socket;
          if (socket && socket.connected) {
            console.log('✅ Socket connected, joining conversation:', id);
            this.chatService.joinConversation(id);
          } else if (attempts < 10) {
            console.log(`⏳ Socket not connected yet (attempt ${attempts + 1}/10), retrying in 500ms...`);
            setTimeout(() => checkConnection(attempts + 1), 500);
          } else {
            console.error('❌ Socket connection timeout after 10 attempts');
          }
        };
        setTimeout(() => checkConnection(), 100);
      }
    });
  }

  ngOnDestroy() {
    if (this.conversationId) {
      this.chatService.leaveConversation(this.conversationId);
    }
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadConversation() {
    if (!this.conversationId) return;

    this.isLoading = true;
    this.chatService.getConversation(this.conversationId).subscribe({
      next: (res: any) => {
        this.conversation = res.conversation;
        this.messages = res.messages || [];
        // Initialiser le statut en ligne depuis la conversation
        console.log('Conversation loaded:', {
          conversation: this.conversation,
          currentUser: this.currentUser,
          client_is_online: this.conversation?.client_is_online,
          driver_is_online: this.conversation?.driver_is_online
        });
        this.otherUserOnline = this.isOtherUserOnline();
        console.log('Initial other user online status:', this.otherUserOnline);
        this.isLoading = false;
        this.scrollToBottom();
        this.chatService.markAsSeen(this.conversationId!);
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        console.error('Error loading conversation:', err);
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  getOtherUserId(): number | null {
    if (!this.conversation || !this.currentUser) return null;
    
    if (this.currentUser.role === 'client') {
      return this.conversation.driver_user_id || null;
    }
    
    if (this.currentUser.role === 'driver') {
      return this.conversation.client_user_id || this.conversation.client_id || null;
    }
    
    return null;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      this.selectedFile = file;
    }
  }

  removeSelectedFile() {
    this.selectedFile = null;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  sendMessage() {
    if (!this.conversationId) return;
    if (!this.newMessage.trim() && !this.selectedFile) return;

    this.isSending = true;
    const messageText = this.newMessage.trim();

    this.chatService.sendMessage(this.conversationId, messageText, this.selectedFile || undefined).subscribe({
      next: (res: any) => {
        if (res.success && res.message) {
          // S'assurer que le message a conversation_id
          if (!res.message.conversation_id) {
            res.message.conversation_id = this.conversationId;
          }
          
          // Vérifier si le message n'existe pas déjà (pour éviter les doublons)
          const messageExists = this.messages.some(m => m.id === res.message.id);
          if (!messageExists) {
            this.messages.push(res.message);
          }
          
          this.newMessage = '';
          this.selectedFile = null;
          if (this.fileInput) {
            this.fileInput.nativeElement.value = '';
          }
          this.scrollToBottom();
          this.cdr.markForCheck();
        }
        this.isSending = false;
      },
      error: (err: any) => {
        console.error('Error sending message:', err);
        alert('Failed to send message. Please try again.');
        this.isSending = false;
        this.cdr.markForCheck();
      }
    });
  }

  scrollToBottom() {
    setTimeout(() => {
      if (this.messagesContainer) {
        const element = this.messagesContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    }, 100);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  isMyMessage(message: any): boolean {
    return message.sender_id === this.currentUser?.id;
  }

  getOtherUserName(): string {
    if (!this.conversation || !this.currentUser) return 'Unknown';
    
    // Si l'utilisateur connecté est un client, afficher le nom du driver
    if (this.currentUser.role === 'client') {
      return this.conversation.driver_name || 'Unknown';
    }
    
    // Si l'utilisateur connecté est un driver, afficher le nom du client
    if (this.currentUser.role === 'driver') {
      return this.conversation.client_name || 'Unknown';
    }
    
    return 'Unknown';
  }

  isOtherUserOnline(): boolean {
    if (!this.conversation || !this.currentUser) return false;
    
    // Si l'utilisateur connecté est un client, vérifier le statut du driver
    if (this.currentUser.role === 'client') {
      return this.conversation.driver_is_online === 1 || this.conversation.driver_is_online === true;
    }
    
    // Si l'utilisateur connecté est un driver, vérifier le statut du client
    if (this.currentUser.role === 'driver') {
      return this.conversation.client_is_online === 1 || this.conversation.client_is_online === true;
    }
    
    return false;
  }

  // Méthode pour mettre à jour le statut en ligne depuis les événements Socket.io
  updateOnlineStatus(userId: number, isOnline: boolean): void {
    const otherUserId = this.getOtherUserId();
    console.log('updateOnlineStatus called:', { userId, isOnline, otherUserId, currentOtherUserOnline: this.otherUserOnline });
    if (otherUserId && userId === otherUserId) {
      this.otherUserOnline = isOnline;
      // Mettre à jour aussi dans la conversation
      if (this.conversation) {
        if (this.currentUser?.role === 'client') {
          this.conversation.driver_is_online = isOnline ? 1 : 0;
        } else if (this.currentUser?.role === 'driver') {
          this.conversation.client_is_online = isOnline ? 1 : 0;
        }
      }
      console.log('Online status updated:', this.otherUserOnline);
      this.cdr.markForCheck();
    } else {
      console.log('User ID mismatch or other user ID not found');
    }
  }

  getFileName(url: string): string {
    if (!url) return '';
    const parts = url.split('/');
    return parts[parts.length - 1];
  }

  downloadFile(url: string) {
    // Extraire le nom de fichier de l'URL
    const filename = this.getFileName(url);
    if (!filename) {
      console.error('Invalid file URL');
      return;
    }
    
    // Télécharger le fichier avec authentification
    this.chatService.downloadAttachment(filename).subscribe({
      next: (blob: Blob) => {
        // Créer un lien de téléchargement
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      },
      error: (err: any) => {
        console.error('Error downloading file:', err);
        alert('Failed to download file. Please try again.');
      }
    });
  }
}

