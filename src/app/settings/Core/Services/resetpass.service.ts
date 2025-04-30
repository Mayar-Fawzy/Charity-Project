import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Environment } from '../../../Pages/Auth/core/Environment/Environment';

@Injectable({
  providedIn: 'root'
})
export class ResetpassService {

private readonly _HttpClient = inject(HttpClient);
  resetPassword(email:string,password:string,confirmPassword:string):Observable<any>{
      return this._HttpClient.post(`${Environment.baseUrl}${Environment.VersionUrl}Account/ResetPassword`, { email,password,confirmPassword});
    }
    
  }