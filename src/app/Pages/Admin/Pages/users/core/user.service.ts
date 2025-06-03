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

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'https://givinghandcharity.runasp.net/api/v1/User/GetAllUsers';

  constructor(private http: HttpClient) { }

  getAllUsers(): Observable<User[]> {
    return this.http.get<{ data: User[] }>(this.apiUrl)
      .pipe(
        map(response => response.data)  // فقط استخرج مصفوفة المستخدمين من الخاصية data
      );
  }

  deleteUser(id: string): Observable<any> {
    const url = `https://givinghandcharity.runasp.net/api/v1/User/DeleteUser?id=${id}`;
    return this.http.delete(url);
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
}
