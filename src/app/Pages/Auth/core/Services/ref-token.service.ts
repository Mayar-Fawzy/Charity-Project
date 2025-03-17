import { inject, Injectable } from '@angular/core';
import { Observable, switchMap, catchError, throwError } from 'rxjs';
import { IResponseResult } from '../../../../core/Shared/Interface/iresponse';
import { Environment } from '../Environment/Environment';
import { ILoginRes } from '../Interfaces/ilogin-res';
import { HttpClient } from '@angular/common/http';
import { Router } from 'express';
import { LoginService } from './login.service';

@Injectable({
  providedIn: 'root'
})
export class RefTokenService {

  private readonly _HttpClient = inject(HttpClient);
  private readonly _LoginService = inject(LoginService);
  refreshToken(): Observable<string> {
    const refreshToken = localStorage.getItem('userRefreshToken');
    const userToken = localStorage.getItem('userToken');
  
   
    return this._HttpClient
      .post<IResponseResult<ILoginRes>>(
        `${Environment.baseUrl}${Environment.VersionUrl}Auth/RefreshToken`,
        { jwt: userToken, refreshJwt: refreshToken }
      )
      .pipe(
        switchMap((response) => {
          const newToken = response.data.jwtModel.jwt;
          const newRefreshToken = response.data.refreshJWTModel.refreshJWT;
            
          // تحديث التوكين في localStorage
          localStorage.setItem('userToken', newToken);
          localStorage.setItem('userRefreshToken', newRefreshToken);
  
          return new Observable<string>((observer) => {
            observer.next(newToken);
            observer.complete();
          });
        }),
        catchError((error) => {
          this._LoginService.signOut();
          return throwError(() => error);
        })
      );
  }
 
}
