
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {  Observable } from 'rxjs';
import { Environment } from '../Environment/Environment';
import { IResponseResult } from '../../../../core/Shared/Interface/iresponse';
import { Router } from '@angular/router';
import { IRegisterReq } from '../Interfaces/i-register-req';
import { IRegisterRes } from '../Interfaces/i-register-res';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  userData: any;
  private readonly _HttpClient = inject(HttpClient);
  private readonly _Router = inject(Router);

  Register(userData:IRegisterReq):Observable<IResponseResult<IRegisterRes>>{
    return this._HttpClient.post<IResponseResult<IRegisterRes>>(  `${Environment.baseUrl}${Environment.VersionUrl}Auth/Register`, userData);
  }
  confirmEmail(emailData: { to: string; subject: string; body: string; attachments?: File }): Observable<any> {
    const formData = new FormData();
    formData.append('to', emailData.to);
    formData.append('subject', emailData.subject);
    formData.append('body', emailData.body);

    // إضافة المرفقات إن وجدت
    if (emailData.attachments) {
      formData.append('attachments', emailData.attachments);
    }

    return this._HttpClient.post(`${Environment.baseUrl}${Environment.VersionUrl}Email/SendEmail`, formData);
  }
}
