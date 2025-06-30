import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  imageUrl: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: number;
  isLocked: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'https://givinghandcharity.runasp.net/api/v1/User/GetAllUsers';
  private notificationApiUrl = 'https://givinghandcharity.runasp.net/api/v1/Notification';

  constructor(private http: HttpClient) { }

  getAllUsers(): Observable<User[]> {
    return this.http.get<{ data: User[] }>(this.apiUrl)
      .pipe(map(response => response.data));
  }

  deleteUser(id: string): Observable<any> {
    const url = `${this.apiUrl}/DeleteUser?id=${id}`;
    return this.http.delete(url);
  }

  updateMessage(message: Message): Observable<any> {
    const url = `${this.notificationApiUrl}/UpdateMessage`;
    return this.http.put(url, message);
  }

  lockAccount(email: string): Observable<any> {
    const url = `https://givinghandcharity.runasp.net/api/v1/Account/LockAccount`;
    return this.http.post(url, { email }, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  unlockAccount(email: string): Observable<any> {
    const url = `https://givinghandcharity.runasp.net/api/v1/Account/UnlockAccount`;
    return this.http.post(url, { email }, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  getUserById(id: string): Observable<User> {
    const url = `https://givinghandcharity.runasp.net/api/v1/User/GetUserById?id=${id}`;
    return this.http.get<{ data: User }>(url)
      .pipe(map(response => response.data));
  }
}