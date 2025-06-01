import { Injectable, OnDestroy, NgZone } from '@angular/core';
import { HubConnection, HubConnectionBuilder, HubConnectionState, IHttpConnectionOptions } from '@microsoft/signalr';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SignalrService implements OnDestroy {
  private hubConnection!: HubConnection;
  private isConnected = false;
  private retryDelays = [0, 2000, 5000, 10000, 30000];
  private currentUserId: string | null = null;

  private notificationSubject = new Subject<any>();
  notifications$ = this.notificationSubject.asObservable();



  async startConnection(userId: string): Promise<void> {
    if (this.isConnected || this.hubConnection?.state === HubConnectionState.Connected) {
      return;
    }

    this.currentUserId = userId;
    this.initializeConnection(userId);

    try {
      await this.hubConnection.start();
      this.isConnected = true;
      console.log('✅ SignalR Connected');
    } catch (err) {
      console.error('❌ فشل الاتصال:', err);
      setTimeout(() => this.startConnection(userId), 5000);
    }
  }

  private initializeConnection(userId: string) {
    const options: IHttpConnectionOptions = {
      withCredentials: true,
      accessTokenFactory: () => localStorage.getItem('userToken') || ''
    };

    this.hubConnection = new HubConnectionBuilder()
      .withUrl(`https://givinghandcharity.runasp.net/notificationHub?userId=${userId}`, options)
      .withAutomaticReconnect(this.retryDelays)
      .build();

    this.registerEvents();
  }
  constructor(private ngZone: NgZone) { }
  private registerEvents() {
    this.hubConnection.onreconnecting(() => {
      this.isConnected = false;
      console.log('🔄 جاري إعادة الاتصال...');
    });

    this.hubConnection.onreconnected(() => {
      this.isConnected = true;
      console.log('✅ تم إعادة الاتصال بنجاح');
    });

    // this.hubConnection.on('ReceiveNotification', (notification) => {
    //   this.ngZone.run(() => {
    //     this.notificationSubject.next(notification);
    //   });

    // });

    this.hubConnection.on('ReceiveNotification', (notification) => {
      console.log('📥 إشعار تم استقباله من SignalR:', notification); // ← مهم جدًا
      this.ngZone.run(() => {
        this.notificationSubject.next(notification);
      });
    });


    this.hubConnection.onclose(error => {
      this.isConnected = false;
      console.error('❌ تم إغلاق الاتصال بسبب:', error);
      if (this.currentUserId) {
        this.startConnection(this.currentUserId);
      }
    });
  }

  async stopConnection(): Promise<void> {
    if (this.isConnected && this.hubConnection.state === HubConnectionState.Connected) {
      await this.hubConnection.stop();
      this.isConnected = false;
    }
  }

  ngOnDestroy() {
    this.stopConnection();
  }
}