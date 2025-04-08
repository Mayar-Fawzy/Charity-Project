import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Environment } from '../Environment/Environment';

@Injectable({
  providedIn: 'root'
})
export class ForgetpasswordService {

    private readonly _HttpClient = inject(HttpClient);
    forgetPassword(email: string) {
        return this._HttpClient.post(`${Environment.baseUrl}${Environment.VersionUrl}Account/SendVerifyCode`, { email });
    }
}
