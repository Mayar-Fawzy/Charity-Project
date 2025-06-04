import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Environment } from '../../../Pages/Auth/core/Environment/Environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileservicesService {
  private readonly _HttpClient = inject(HttpClient);

  GetUserById(id: string): Observable<any> {
    return this._HttpClient.get(`${Environment.baseUrl}${Environment.VersionUrl}User/GetUserById?id=${id}`);
  }

  UpdateUser(id: string, userData: any): Observable<any> {
    return this._HttpClient.put(`${Environment.baseUrl}${Environment.VersionUrl}User/UpdateUser?id=${id}`, userData);
  }

  RemoveUserImage(id: string): Observable<any> {
    return this._HttpClient.delete(`${Environment.baseUrl}${Environment.VersionUrl}User/RemoveUserImage?id=${id}`);
  }

  UploadUserImage(id: string, imageData: FormData): Observable<any> {
    return this._HttpClient.post(`${Environment.baseUrl}${Environment.VersionUrl}User/UploadUserImage?id=${id}`, imageData);
  }

}