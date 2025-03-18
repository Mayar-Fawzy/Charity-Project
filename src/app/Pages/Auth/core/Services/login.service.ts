import { ILoginReq } from './../Interfaces/ilogin-req';
import { ILoginRes } from './../Interfaces/ilogin-res';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {  Observable } from 'rxjs';
import { Environment } from '../Environment/Environment';
import { IResponseResult } from '../../../../core/Shared/Interface/iresponse';
import { jwtDecode } from 'jwt-decode';
import { Decode } from '../../../../core/interfaces/decode';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root',
})
export class LoginService {
 userData: any;
  private readonly _HttpClient = inject(HttpClient);
  private readonly _Router = inject(Router);

  login(userdata: ILoginReq): Observable<IResponseResult<ILoginRes>> {
    return this._HttpClient.post<IResponseResult<ILoginRes>>(
      `${Environment.baseUrl}${Environment.VersionUrl}Auth/Login`,
      userdata
    );
  }

  
  saveUserAuth(): Decode | null {
    const token = localStorage.getItem('userToken');
    if (token) {
      this.userData = jwtDecode(token);
      return this.userData;
    }
    return null;
  }

  signOut(): void {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userRefreshToken');
    this.userData = null;
    this._Router.navigate(['/login'])
  } 
}
