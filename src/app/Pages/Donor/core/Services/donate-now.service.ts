import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { InkindDonation } from '../interface/inkind-donation';
import { Observable } from 'rxjs';
import { Environment } from '../../../Auth/core/Environment/Environment';

@Injectable({
  providedIn: 'root'
})
export class DonateNowService {

  constructor() { }
  private readonly _HttpClient = inject(HttpClient);
  CreateInKindDonation(userData:InkindDonation):Observable<any>{
    return this._HttpClient.post(`${Environment.baseUrl}${Environment.VersionUrl}InKindDonation/CreateInKindDonation`,userData)
  }
}
