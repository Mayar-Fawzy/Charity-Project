import { ILoginReq } from './../Interfaces/ilogin-req';
import { ILoginRes } from './../Interfaces/ilogin-res';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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
  donorId!: string;

role!: any;
  private readonly _HttpClient = inject(HttpClient);
  private readonly _Router = inject(Router);

  login(userdata: ILoginReq): Observable<IResponseResult<ILoginRes>> {
    return this._HttpClient.post<IResponseResult<ILoginRes>>(
      `${Environment.baseUrl}${Environment.VersionUrl}Account/Login`,
      userdata
    );
  }


  // saveUserAuth(): Decode | null {
  //   const token = sessionStorage.getItem('userToken');
  //   if (token) {
  //     this.userData = jwtDecode(token);
  //     this.donorId = this.userData["http://schemas.microsoft.com/ws/2008/06/identity/claims/primarysid"];
  //     return this.userData;
  //   }
  //   return null;
  // }

  saveUserAuth(): Decode | null {
    const token = sessionStorage.getItem('userToken');
    if (token) {
      this.userData = jwtDecode(token);
      this.donorId = this.userData["http://schemas.microsoft.com/ws/2008/06/identity/claims/primarysid"];
      this.role = this.userData["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
      return this.userData;
    }
    return null;
  }

  signOut(): void {
    sessionStorage.removeItem('userToken');
    sessionStorage.removeItem('userRefreshToken');
    this.userData = null;
    this._Router.navigate(['/login'])
  }



  getUserData(): Decode | null {
    return this.userData;
  }



  getUserId(): string | null {
    return this.donorId || null;
  }

}
