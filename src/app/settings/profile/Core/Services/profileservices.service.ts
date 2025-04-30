import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Environment } from '../../../../Pages/Auth/core/Environment/Environment';

@Injectable({
  providedIn: 'root'
})
export class ProfileservicesService {
private readonly _HttpClient = inject(HttpClient);
GetUserById(id: string) {
  return this._HttpClient.get(`${Environment.baseUrl}${Environment.VersionUrl}User/GetUserById?id=/${id}`);  }
  UpdateUser(id: string, userData: FormData) {
    return this._HttpClient.put(`${Environment.baseUrl}${Environment.VersionUrl}User/UpdateUser?id=/${id}`, userData);
  }

}
