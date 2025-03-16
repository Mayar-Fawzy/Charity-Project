import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Environment } from '../Environment/Environment';

@Injectable({
  providedIn: 'root',
})
export class LoginService {

  private readonly _HttpClient = inject(HttpClient);
  login(userdata:any): Observable<any> {
    return this._HttpClient.post(`${Environment.baseUrl}${Environment.VersionUrl}Auth/Login`,
    userdata)
  }
}
