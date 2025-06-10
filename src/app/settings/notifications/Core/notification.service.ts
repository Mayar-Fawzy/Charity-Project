import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private baseUrl = 'https://givinghandcharity.runasp.net/api/v1/Notification';

  public countChangedSubject = new Subject<number>();

  countChanged$ = this.countChangedSubject.asObservable();

  constructor(private http: HttpClient) { }

  getNotificationsByReceiver(userId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/GetAllMessagesByReceiveId?receiveId=${userId}`);
  }

  markAsRead(notificationId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/MakeMessageIsRead?messageId=${notificationId}`, {}).pipe(
      tap(() => this.countChangedSubject.next(-1))
    );
  }

  getNotificationCount(userId: string): Observable<number> {
    return this.http.get<any>(`${this.baseUrl}/GetCountMessagesById?receiveId=${userId}`)
      .pipe(
        tap(res => console.log(' Count response:', res)),
        tap(res => {
          if (typeof res.data !== 'undefined') {
            const parsed = parseInt(res.data, 10);
            if (isNaN(parsed)) throw new Error('Invalid count');
          }
        }),
        map(res => parseInt(res.data, 10))
      );
  }

  deleteNotification(messageId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/SoftDeleteMessage?messageId=${messageId}`);
  }

  sendMessageToUser(senderId: string, receiverId: string, message: string) {
    const url = 'https://givinghandcharity.runasp.net/api/v1/Notification/send-to-user';
    const body = {
      senderId,
      receiverId,
      message
    };

    return this.http.post(url, body);
  }

  sendMessageToAllUsers(senderId: string, message: string): Observable<any> {
    const url = 'https://givinghandcharity.runasp.net/api/v1/Notification/send-to-all';
    const body = {
      senderId,
      message
    };

    return this.http.post(url, body);
  }

  getMessagesSentByAdminToUser(adminId: string, userId: string): Observable<any> {
    const url = `${this.baseUrl}/GetAllMessagesBySendId?SendId=${adminId}`;
    return this.http.get<any>(url).pipe(
      map(res => {
        const filtered = res.data?.filter((msg: any) => msg.receiveId?.trim() === userId.trim());
        return {
          ...res,
          data: filtered
        };
      })
    );
  }


}