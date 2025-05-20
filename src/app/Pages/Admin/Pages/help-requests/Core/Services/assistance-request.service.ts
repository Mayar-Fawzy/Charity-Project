import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Environment } from '../../../../../Auth/core/Environment/Environment';

@Injectable({
  providedIn: 'root'
})
export class AssistanceRequestService {
  private readonly _HttpClient = inject(HttpClient);
  // GetPaginatedAssistanceRequests(pageNumber: number, pageSize: number, orderByDirection: number = 1): Observable<any> {
  //   return this._HttpClient.get<any>(`${Environment.baseUrl}${Environment.VersionUrl}AssistanceRequest/GetPaginatedAssistanceRequests?pageNumber=${pageNumber}&pageSize=${pageSize}&orderByDirection=${orderByDirection}`)
  // }

  GetPaginatedAssistanceRequests(requestStatus:number,pageNumber: number, pageSize: number,  orderByDirection: number = 1): Observable<any> {
       return this._HttpClient.get<any>(`${Environment.baseUrl}${Environment.VersionUrl}AssistanceRequest/GetPaginatedByRequestStatus?requestStatus=${requestStatus}&pageNumber=${pageNumber}&pageSize=${pageSize}&orderByDirection=${orderByDirection}`)
   
  }

  UpdateReq(body: any): Observable<any> {
    return this._HttpClient.put(`${Environment.baseUrl}${Environment.VersionUrl}AssistanceRequest/UpdateAssistanceRequest `, body)
  }
  Delete(id: string): Observable<any> {
    return this._HttpClient.delete(`${Environment.baseUrl}${Environment.VersionUrl}AssistanceRequest/DeleteAssistanceRequest?id=${id}`)
  }
  

}
