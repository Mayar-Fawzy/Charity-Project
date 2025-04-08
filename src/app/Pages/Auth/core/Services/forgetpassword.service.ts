import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Environment } from '../Environment/Environment';
import { observableToBeFn } from 'rxjs/internal/testing/TestScheduler';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ForgetpasswordService {

    private readonly _HttpClient = inject(HttpClient);
    forgetPassword(email: string):Observable<any> {
        return this._HttpClient.post(`${Environment.baseUrl}${Environment.VersionUrl}Account/SendVerifyCode`, { email });
    }
    verifyRestCode(email:string,code:string):Observable<any>{
      return this._HttpClient.post(`${Environment.baseUrl}${Environment.VersionUrl}Account/VerifyCode`, { email,code});
    }

}
