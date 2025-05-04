import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Environment } from '../../../Auth/core/Environment/Environment';
import { IprojectDonate } from '../../../Donor/core/interface/iproject-donate';

@Injectable({
  providedIn: 'root'
})
export class InkinddonationService {

  constructor() { }
    private readonly _HttpClient = inject(HttpClient);
  
  
    GetPaginatedinKindDonations(pageNumber:number,pageSize:number,orderByDirection:number=1):Observable<any>{
      return this._HttpClient.get<any>(`${Environment.baseUrl}${Environment.VersionUrl}InKindDonation/GetPaginatedinKindDonations?pageNumber=${pageNumber}&pageSize=${pageSize}&orderByDirection=${orderByDirection}`)
    }
}
