import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignalrService } from './Core/signalr.service';
import { NotificationService } from './Core/notification.service';
import { LoginService } from '../../../app/Pages/Auth/core/Services/login.service';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

interface Notification {
  id: string;
  title: string;
  message: string;
  timeValue: number;
  timeUnit: string;
  bgClass: string;
  icon: string;
  iconColor: string;
  isRead: boolean;
  type: string;
  createdAt: string;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  unreadCount = 0;
  isLoading = true;
  errorMessage = '';
  private destroy$ = new Subject<void>();

  constructor(
    private signalr: SignalrService,
    private notificationService: NotificationService,
    private loginService: LoginService,
    private router: Router
  ) { }

  ngOnInit() {
    const userData = this.loginService.saveUserAuth();
    const userId = userData?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/primarysid'];

    if (!userId) {
      this.handleUnauthenticated();
      return;
    }

    this.loadNotifications(userId);
    this.setupSignalR(userId);
  }

  private loadNotifications(userId: string) {
    this.isLoading = true;
    this.notificationService.getNotificationsByReceiver(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          if (res && res.data && Array.isArray(res.data)) {
            this.notifications = res.data.map(this.mapNotification);
            this.unreadCount = this.notifications.filter(n => !n.isRead).length;
            this.notificationService.countChangedSubject.next(this.unreadCount);
          } else {
            console.warn('الاستجابة لا تحتوي على بيانات الإشعارات', res);
          }
          this.isLoading = false;
        },
        error: (err) => {
          this.handleError('فشل تحميل الإشعارات', err);
        }
      });
  }

  private setupSignalR(userId: string) {
    this.signalr.startConnection(userId).then(() => {
      console.log('✅ SignalR connected.');

      this.signalr.notifications$
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (newNotification) => {
            if (!this.notifications.some(n => n.id === newNotification.id)) {
              const notification = this.mapNotification(newNotification);
              this.notifications = [notification, ...this.notifications];
              if (!notification.isRead) {
                this.unreadCount++;
                this.notificationService.countChangedSubject.next(this.unreadCount);
              }
            }
          },
          error: (err) => console.error('SignalR notification error:', err)
        });
    }).catch(err => {
      this.handleError('فشل الاتصال بـ SignalR', err);
    });
  }

  onMarkAsRead(id: string) {
    const notification = this.notifications.find(n => n.id === id);
    if (!notification || notification.isRead) return;

    this.notificationService.markAsRead(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notifications = this.notifications.map(n =>
            n.id === id ? { ...n, isRead: true } : n
          );
          this.unreadCount--;
          this.notificationService.countChangedSubject.next(this.unreadCount);
        },
        error: (err) => {
          console.error('فشل تعليم الإشعار كمقروء:', err);
          const userId = this.loginService.saveUserAuth()?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/primarysid'];
          if (userId) this.loadNotifications(userId);
        }
      });
  }

  onDeleteNotification(id: number | string) {
    this.notifications = this.notifications.filter(n => n.id !== id);
  }

  private handleUnauthenticated() {
    this.notifications = [];
    this.errorMessage = 'يجب تسجيل الدخول لمشاهدة الإشعارات';
    this.isLoading = false;
    this.router.navigate(['/login']);
  }

  private handleError(message: string, err?: any) {
    console.error(message, err);
    this.errorMessage = message;
    this.isLoading = false;
  }

  private mapNotification = (apiNotification: any): Notification => {
    const { value: timeValue, unit: timeUnit } = this.getTimeAgo(apiNotification.createdDate);

    return {
      id: apiNotification.id,
      title: this.getTitleByType(apiNotification.type || 'general'),
      message: apiNotification.message,
      timeValue,
      timeUnit,
      bgClass: this.getBgClass(apiNotification.type || 'general'),
      icon: this.getIcon(apiNotification.type || 'general'),
      iconColor: this.getIconColor(apiNotification.type || 'general'),
      isRead: apiNotification.isRead,
      type: apiNotification.type || 'general',
      createdAt: apiNotification.createdDate
    };
  };

  private getTimeAgo(createdAt: string): { value: number, unit: string } {
    const now = new Date();
    const created = new Date(createdAt + 'Z');
    const diffInMinutes = Math.floor((now.getTime() - created.getTime()) / 60000);

    const minutesInHour = 60;
    const minutesInDay = 1440;
    const minutesInMonth = 43200;

    if (diffInMinutes < minutesInHour) {
      return { value: diffInMinutes, unit: 'د' };
    }

    if (diffInMinutes < minutesInDay) {
      const hours = Math.floor(diffInMinutes / minutesInHour);
      return { value: hours, unit: 'س' };
    }

    if (diffInMinutes < minutesInMonth) {
      const days = Math.floor(diffInMinutes / minutesInDay);
      return { value: days, unit: 'ي' };
    }

    const months = Math.floor(diffInMinutes / minutesInMonth);
    return { value: months, unit: 'ش' };
  }


  private getTitleByType(type: string): string {
    const titles: Record<string, string> = {
      task: 'مهمة جديدة',
      donation: 'تبرع جديد',
      urgent: 'إشعار هام',
      completed: 'تمت المهمة',
      general: 'إشعار عام'
    };
    return titles[type] || 'إشعار جديد';
  }

  private getBgClass(type: string): string {
    const classes: Record<string, string> = {
      task: 'bg-light-success',
      donation: 'bg-light-primary',
      urgent: 'bg-light-warning',
      completed: 'bg-light-secondary'
    };
    return classes[type] || 'bg-light';
  }

  private getIcon(type: string): string {
    const icons: Record<string, string> = {
      task: 'bi bi-clipboard-check',
      donation: 'bi bi-cash-coin',
      urgent: 'bi bi-exclamation-triangle',
      completed: 'bi bi-check-circle'
    };
    return icons[type] || 'bi bi-bell';
  }

  private getIconColor(type: string): string {
    const colors: Record<string, string> = {
      task: 'bg-success',
      donation: 'bg-primary',
      urgent: 'bg-warning',
      completed: 'bg-secondary'
    };
    return colors[type] || 'bg-info';
  }

  trackById(index: number, notification: Notification): string {
    return notification.id;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.signalr.stopConnection();
  }
}