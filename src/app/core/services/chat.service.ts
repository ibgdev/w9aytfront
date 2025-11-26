import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private baseUrl = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
    ? 'http://localhost:3200/api/chat'
    : '/api/chat';
  
  private socketUrl = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
    ? 'http://localhost:3200'
    : '';

  private socket: Socket | null = null;
  private messageSubject = new Subject<any>();
  private notificationSubject = new Subject<any>();
  private onlineStatusSubject = new Subject<any>();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Obtenir les headers avec le token d'authentification
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (token) {
      return new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
    }
    console.warn('No token available for chat service');
    return new HttpHeaders();
  }

  // Obtenir les options HTTP avec headers (pour FormData, on ne définit pas Content-Type)
  private getHttpOptions(includeContentType: boolean = true): any {
    const token = this.authService.getToken();
    const headers: any = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.warn('No token available for chat service');
    }
    
    if (!includeContentType) {
      // Pour FormData, on laisse le navigateur définir le Content-Type automatiquement
      return { headers: new HttpHeaders(headers) };
    }
    
    return { headers: new HttpHeaders(headers) };
  }

  // Initialiser la connexion Socket.io
  initializeSocket(): void {
    // Si déjà connecté, ne rien faire
    if (this.socket?.connected) {
      console.log('Socket already connected, socket ID:', this.socket.id);
      return;
    }

    // Si une instance existe mais n'est pas connectée, la nettoyer
    if (this.socket && !this.socket.connected) {
      console.log('Cleaning up disconnected socket');
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }

    const token = this.authService.getToken();
    if (!token) {
      console.error('No token available for socket connection');
      return;
    }

    console.log('Initializing Socket.io connection to:', this.socketUrl);
    this.socket = io(this.socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    // Configurer les listeners UNE SEULE FOIS
    this.socket.on('connect', () => {
      console.log('✅ Socket connected successfully, socket ID:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('❌ Socket disconnected, reason:', reason);
    });

    this.socket.on('connect_error', (error: any) => {
      console.error('❌ Socket connection error:', error);
    });

    this.socket.on('reconnect', (attemptNumber: number) => {
      console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
    });

    this.socket.on('new_message', (message: any) => {
      console.log('📨 Received new_message via socket:', message);
      if (message && message.id) {
        this.messageSubject.next(message);
      } else {
        console.warn('Invalid message format received:', message);
      }
    });

    this.socket.on('new_message_notification', (data: any) => {
      console.log('🔔 Received new_message_notification:', data);
      this.notificationSubject.next(data);
    });

    this.socket.on('user_online_status', (data: any) => {
      console.log('🟢 Received user_online_status:', data);
      // Normaliser le format des données
      const normalizedData = {
        user_id: data.user_id || data.userId,
        is_online: data.is_online !== undefined ? data.is_online : (data.isOnline !== undefined ? data.isOnline : false)
      };
      console.log('📤 Emitting normalized online status:', normalizedData);
      this.onlineStatusSubject.next(normalizedData);
    });

    this.socket.on('error', (error: any) => {
      console.error('❌ Socket error:', error);
    });
  }

  // Déconnecter Socket.io
  disconnectSocket(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Rejoindre une conversation
  joinConversation(conversationId: number): void {
    if (this.socket && this.socket.connected) {
      console.log('Joining conversation:', conversationId);
      this.socket.emit('join_conversation', conversationId);
    } else {
      console.warn('Socket not connected, cannot join conversation. Retrying...');
      // Réessayer après un court délai
      setTimeout(() => {
        if (this.socket && this.socket.connected) {
          this.socket.emit('join_conversation', conversationId);
        } else {
          console.error('Socket still not connected after retry');
        }
      }, 1000);
    }
  }

  // Quitter une conversation
  leaveConversation(conversationId: number): void {
    if (this.socket) {
      this.socket.emit('leave_conversation', conversationId);
    }
  }

  // Écouter les nouveaux messages
  onNewMessage(): Observable<any> {
    return this.messageSubject.asObservable();
  }

  // Écouter les notifications de nouveaux messages
  onNewMessageNotification(): Observable<any> {
    return this.notificationSubject.asObservable();
  }

  // Écouter les changements de statut en ligne
  onOnlineStatusChange(): Observable<any> {
    return this.onlineStatusSubject.asObservable();
  }

  // Créer ou récupérer une conversation pour une delivery
  createOrGetConversation(deliveryId: number): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/conversations`, 
      { delivery_id: deliveryId },
      { headers: this.getAuthHeaders() }
    );
  }

  // Récupérer toutes les conversations de l'utilisateur
  getUserConversations(): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/conversations`,
      { headers: this.getAuthHeaders() }
    );
  }

  // Récupérer une conversation spécifique avec ses messages
  getConversation(conversationId: number): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/conversations/${conversationId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  // Envoyer un message via HTTP (avec upload de fichier)
  sendMessage(conversationId: number, text: string, file?: File): Observable<any> {
    const formData = new FormData();
    formData.append('conversation_id', conversationId.toString());
    if (text) {
      formData.append('text', text);
    }
    if (file) {
      formData.append('file', file);
    }

    // Pour FormData, on ne définit pas Content-Type (le navigateur le fait automatiquement)
    return this.http.post<any>(
      `${this.baseUrl}/messages`, 
      formData,
      this.getHttpOptions(false)
    );
  }

  // Envoyer un message via Socket.io (pour les messages texte uniquement)
  sendMessageViaSocket(conversationId: number, text: string): void {
    if (this.socket) {
      this.socket.emit('send_message', {
        conversation_id: conversationId,
        text
      });
    }
  }

  // Marquer les messages comme vus
  markAsSeen(conversationId: number): void {
    if (this.socket) {
      this.socket.emit('mark_as_seen', conversationId);
    }
  }

  // Télécharger un fichier avec authentification
  downloadAttachment(filename: string): Observable<Blob> {
    return this.http.get(
      `${this.baseUrl}/attachments/${filename}`,
      {
        headers: this.getAuthHeaders(),
        responseType: 'blob'
      }
    );
  }
}

