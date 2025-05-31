import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Environment } from '../../../../../Auth/core/Environment/Environment';

@Injectable({
  providedIn: 'root'
})
export class InkindDonationAdminService {

  constructor() { }
    private readonly _HttpClient = inject(HttpClient);
  
  
    GetPaginatedinKindDonations(pageNumber:number,pageSize:number,orderByDirection:number=1):Observable<any>{
      return this._HttpClient.get<any>(`${Environment.baseUrl}${Environment.VersionUrl}InKindDonation/GetPaginatedinKindDonations?pageNumber=${pageNumber}&pageSize=${pageSize}&orderByDirection=${orderByDirection}`)
    }
    UpdateInKindDonation(formdata:FormData):Observable<any>{
      return this._HttpClient.put(`${Environment.baseUrl}${Environment.VersionUrl}InKindDonation/UpdateInKindDonation`,formdata)
  }
  DeleteInKindDonation(id:string):Observable<any>{
    return this._HttpClient.delete(`${Environment.baseUrl}${Environment.VersionUrl}InKindDonation/DeleteInKindDonation?id=${id}`)
  }
}

