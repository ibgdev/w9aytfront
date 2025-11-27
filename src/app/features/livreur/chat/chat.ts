import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../core/services/chat.service';
import { AuthService } from '../../../core/services/auth.service';
import { SidebarComponent } from '../sidebar/sidebar';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat-livreur',
  imports: [CommonModule, FormsModule, RouterModule, SidebarComponent],
  templateUrl: './chat.html',
  styleUrl: './chat.scss',
})
export class ChatLivreur implements OnInit, OnDestroy {
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
  conversations: any[] = [];
  filteredConversations: any[] = [];
  isLoadingConversations: boolean = false;
  searchQuery: string = '';
  showEmojiPicker: boolean = false;
  private subscriptions: Subscription[] = [];
  private documentClickHandler: ((event: MouseEvent) => void) | null = null;

  // Liste d'emojis populaires
  emojis: string[] = [
    '😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂',
    '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋',
    '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳',
    '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖',
    '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯',
    '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔',
    '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦',
    '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴',
    '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿',
    '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖',
    '👍', '👎', '👊', '✊', '🤛', '🤜', '🤞', '✌️', '🤟', '🤘',
    '🤙', '👌', '🤌', '🤏', '👈', '👉', '👆', '👇', '☝️', '👋',
    '🤚', '🖐', '✋', '🖖', '👏', '🙌', '🤲', '🤝', '🙏', '✍️',
    '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '👶', '👧',
    '🧒', '👦', '👩', '🧑', '👨', '👩‍🦱', '👨‍🦱', '👩‍🦰', '👨‍🦰', '👱‍♀️',
    '👱', '👩‍🦳', '👨‍🦳', '👩‍🦲', '👨‍🦲', '🧔', '👵', '🧓', '👴', '👲',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
    '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️',
    '✝️', '☪️', '🕉', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐',
    '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐',
    '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳',
    '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️',
    '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️',
    '🆘', '❌', '⭕', '🛑', '⛔', '📛', '🚫', '💯', '💢', '♨️',
    '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🚭', '❗', '❕', '❓',
    '❔', '‼️', '⁉️', '🔅', '🔆', '〽️', '⚠️', '🚸', '🔱', '⚜️',
    '🔰', '♻️', '✅', '🈯', '💹', '❇️', '✳️', '❎', '🌐', '💠',
    'Ⓜ️', '🌀', '💤', '🏧', '🚾', '♿', '🅿️', '🈳', '🈂️', '🛂',
    '🛃', '🛄', '🛅', '🚹', '🚺', '🚼', '🚻', '🚮', '🎦', '📶',
    '🈁', '🔣', 'ℹ️', '🔤', '🔡', '🔠', '🔢', '#️⃣', '*️⃣', '0️⃣',
    '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'
  ];

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private chatService: ChatService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    
    // Charger les conversations
    this.loadConversations();
    
    // Fermer le picker d'emojis si on clique ailleurs
    this.documentClickHandler = this.handleDocumentClick.bind(this);
    document.addEventListener('click', this.documentClickHandler);
    
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
      // Recharger les conversations pour mettre à jour les derniers messages
      this.loadConversations();
    });
    this.subscriptions.push(messageSub);

    // Écouter les notifications de nouveaux messages
    const notificationSub = this.chatService.onNewMessageNotification().subscribe((data: any) => {
      this.loadConversations();
    });
    this.subscriptions.push(notificationSub);

    // Écouter les changements de statut en ligne
    const onlineStatusSub = this.chatService.onOnlineStatusChange().subscribe((data: any) => {
      console.log('onOnlineStatusChange received:', data);
      this.updateOnlineStatus(data.user_id, data.is_online);
    });
    this.subscriptions.push(onlineStatusSub);

    // Initialiser Socket.io après avoir configuré les listeners
    this.chatService.initializeSocket();

    this.route.params.subscribe(params => {
      const id = params['id'] ? +params['id'] : null;
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
      } else if (!id) {
        // Pas d'ID dans l'URL, réinitialiser
        this.conversationId = null;
        this.conversation = null;
        this.messages = [];
      }
    });
  }

  ngOnDestroy() {
    if (this.conversationId) {
      this.chatService.leaveConversation(this.conversationId);
    }
    this.subscriptions.forEach(sub => sub.unsubscribe());
    // Retirer le listener de clic
    if (this.documentClickHandler) {
      document.removeEventListener('click', this.documentClickHandler);
      this.documentClickHandler = null;
    }
  }

  // Gérer les clics sur le document pour fermer le picker d'emojis
  handleDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (this.showEmojiPicker && 
        !target.closest('.emoji-picker-container') && 
        !target.closest('.emoji-btn')) {
      this.showEmojiPicker = false;
      this.cdr.markForCheck();
    }
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
    
    // Si l'utilisateur connecté est un driver, retourner l'ID du client
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
    
    // Si l'utilisateur connecté est un driver, afficher le nom du client
    if (this.currentUser.role === 'driver') {
      return this.conversation.client_name || 'Unknown';
    }
    
    return 'Unknown';
  }

  isOtherUserOnline(): boolean {
    if (!this.conversation || !this.currentUser) return false;
    
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
        if (this.currentUser?.role === 'driver') {
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

  // Charger toutes les conversations
  loadConversations() {
    this.isLoadingConversations = true;
    this.chatService.getUserConversations().subscribe({
      next: (res: any) => {
        this.conversations = res.conversations || [];
        this.filterConversations();
        this.isLoadingConversations = false;
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        console.error('Error loading conversations:', err);
        this.isLoadingConversations = false;
        this.cdr.markForCheck();
      }
    });
  }

  // Filtrer les conversations selon la recherche
  filterConversations() {
    if (!this.searchQuery || this.searchQuery.trim() === '') {
      this.filteredConversations = [...this.conversations];
    } else {
      const query = this.searchQuery.toLowerCase().trim();
      this.filteredConversations = this.conversations.filter(conv => {
        const name = (conv.other_user_name || '').toLowerCase();
        const message = (conv.last_message_text || '').toLowerCase();
        const subject = (conv.subject || '').toLowerCase();
        const deliveryStatus = (conv.delivery_status || '').toLowerCase();
        const pickupAddress = (conv.pickup_address || '').toLowerCase();
        const dropoffAddress = (conv.dropoff_address || '').toLowerCase();
        const deliveryId = (conv.delivery_id || '').toString();
        
        return name.includes(query) || 
               message.includes(query) || 
               subject.includes(query) ||
               deliveryStatus.includes(query) ||
               pickupAddress.includes(query) ||
               dropoffAddress.includes(query) ||
               deliveryId.includes(query);
      });
    }
    // Trier par dernier message (le plus récent en premier)
    this.filteredConversations.sort((a, b) => {
      const timeA = new Date(a.last_message_time || 0).getTime();
      const timeB = new Date(b.last_message_time || 0).getTime();
      return timeB - timeA;
    });
  }

  // Ouvrir une conversation
  openConversation(conversationId: number) {
    this.router.navigate(['/livreur/chat', conversationId]);
  }

  // Obtenir les initiales d'un nom
  getInitials(name: string): string {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  // Formater l'heure pour la liste des conversations
  formatConversationTime(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    
    // Format HH:MM pour les messages du même jour ou récents
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  // Formater l'heure pour les messages
  formatTime(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  // Obtenir le label de date
  getDateLabel(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isYesterday = new Date(now.getTime() - 86400000).toDateString() === date.toDateString();
    
    if (isToday) return 'Today';
    if (isYesterday) return 'Yesterday';
    
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  }

  // Vérifier si on doit afficher le label de date
  shouldShowDateLabel(message: any, index: number): boolean {
    if (index === 0) return true;
    const currentDate = new Date(message.created_at).toDateString();
    const previousDate = new Date(this.messages[index - 1].created_at).toDateString();
    return currentDate !== previousDate;
  }

  // Vérifier si le dernier message est de l'utilisateur actuel
  isMyLastMessage(conv: any): boolean {
    // Si last_message_sender_id est disponible, l'utiliser
    if (conv.last_message_sender_id !== undefined) {
      return conv.last_message_sender_id === this.currentUser?.id;
    }
    return false;
  }

  // Obtenir le temps depuis la dernière connexion
  getLastSeenTime(): string {
    if (!this.conversation) return '';
    
    // Utiliser les informations disponibles dans la conversation
    if (this.otherUserOnline) {
      return 'online';
    }
    
    // Si on a une date de dernière connexion dans la conversation
    if (this.conversation.last_seen_at) {
      const lastSeen = new Date(this.conversation.last_seen_at);
      const now = new Date();
      const diff = now.getTime() - lastSeen.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);
      
      if (minutes < 1) return 'just now';
      if (minutes < 60) return `${minutes} mins ago`;
      if (hours < 24) return `${hours} hours ago`;
      if (days < 7) return `${days} days ago`;
      return lastSeen.toLocaleDateString();
    }
    
    // Valeur par défaut
    return 'recently';
  }

  // Toggle emoji picker
  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  // Insérer un emoji dans le message
  insertEmoji(emoji: string) {
    if (this.newMessage === undefined) {
      this.newMessage = '';
    }
    this.newMessage += emoji;
    this.showEmojiPicker = false;
    // Focus sur l'input après insertion
    setTimeout(() => {
      const input = document.querySelector('.message-input') as HTMLInputElement;
      if (input) {
        input.focus();
      }
    }, 0);
  }

  // Fermer le picker d'emojis si on clique ailleurs
  closeEmojiPicker(event?: Event) {
    if (event) {
      const target = event.target as HTMLElement;
      if (!target.closest('.emoji-picker-container') && !target.closest('.emoji-btn')) {
        this.showEmojiPicker = false;
      }
    } else {
      this.showEmojiPicker = false;
    }
  }

  // Obtenir le statut de livraison formaté
  getDeliveryStatus(conv: any): string {
    if (!conv.delivery_status) return '';
    const status = conv.delivery_status.toLowerCase();
    const statusMap: { [key: string]: string } = {
      'pending': 'Pending',
      'assigned': 'Assigned',
      'in_transit': 'In Transit',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled'
    };
    return statusMap[status] || conv.delivery_status;
  }

  // Obtenir la couleur du statut
  getDeliveryStatusColor(conv: any): string {
    if (!conv.delivery_status) return '';
    const status = conv.delivery_status.toLowerCase();
    const colorMap: { [key: string]: string } = {
      'pending': '#f59e0b',
      'assigned': '#3b82f6',
      'in_transit': '#8b5cf6',
      'delivered': '#10b981',
      'cancelled': '#ef4444'
    };
    return colorMap[status] || '#718096';
  }
}

