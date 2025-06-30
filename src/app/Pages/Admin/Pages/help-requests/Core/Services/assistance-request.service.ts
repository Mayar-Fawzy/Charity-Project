import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Environment } from '../../../../../Auth/core/Environment/Environment';

@Injectable({
  providedIn: 'root'
})
export class AssistanceRequestService {
  private readonly _HttpClient = inject(HttpClient);
  // GetPaginatedAssistanceRequests(pageNumber: number, pageSize: number, orderByDirection: number = 1): Observable<any> {
  //   return this._HttpClient.get<any>(`${Environment.baseUrl}${Environment.VersionUrl}AssistanceRequest/GetPaginatedAssistanceRequests?pageNumber=${pageNumber}&pageSize=${pageSize}&orderByDirection=${orderByDirection}`)
  // }

  GetPaginatedAssistanceRequests(requestStatus: number, pageNumber: number, pageSize: number, orderByDirection: number = 1): Observable<any> {
    return this._HttpClient.get<any>(`${Environment.baseUrl}${Environment.VersionUrl}AssistanceRequest/GetPaginatedByRequestStatus?requestStatus=${requestStatus}&pageNumber=${pageNumber}&pageSize=${pageSize}&orderByDirection=${orderByDirection}`)

  }

  UpdateReq(body: any): Observable<any> {
    return this._HttpClient.put(`${Environment.baseUrl}${Environment.VersionUrl}AssistanceRequest/UpdateAssistanceRequest`, body)
  }

  Delete(id: string): Observable<any> {
    return this._HttpClient.delete(`${Environment.baseUrl}${Environment.VersionUrl}AssistanceRequest/DeleteAssistanceRequest?id=${id}`)
  }
  SendEmail(body: any): Observable<any> {
    return this._HttpClient.post(`${Environment.baseUrl}${Environment.VersionUrl}Email/SendEmail`, body)
  }

  GetAssistanceRequestById(id: string): Observable<any> {
    return this._HttpClient.get<any>(`${Environment.baseUrl}${Environment.VersionUrl}AssistanceRequest/GetAssistanceRequestById?id=${id}`);
  }

  GetInKindDonationById(id: string): Observable<any> {
    return this._HttpClient.get<any>(
      `${Environment.baseUrl}${Environment.VersionUrl}InKindDonation/GetById?id=${id}`
    );
  }

  createAidDistribution(body: any): Observable<any> {
    return this._HttpClient.post(`${Environment.baseUrl}${Environment.VersionUrl}AidDistribution/CreateAidDistribution`, body);
  }

  updateInKindDonation(body: any): Observable<any> {
    return this._HttpClient.put(`${Environment.baseUrl}${Environment.VersionUrl}InKindDonation/UpdateInKindDonation`, body);
  }

  deleteInKindDonation(id: string): Observable<any> {
    return this._HttpClient.delete(`${Environment.baseUrl}${Environment.VersionUrl}InKindDonation/DeleteInKindDonation?id=${id}`);
  }


  getUserByEmail(email: string): Observable<any> {
    return this._HttpClient.get<any>(`${Environment.baseUrl}${Environment.VersionUrl}User/GetAllUsers`).pipe(
      map(res => {
        const users = res.data || [];
        return users.find((user: any) => user.email.toLowerCase() === email.toLowerCase());
      })
    );
  }


  getRequestByInKindDonationId(inKindDonationId: string): Observable<any> {
    return this._HttpClient.get<any>(
      `${Environment.baseUrl}${Environment.VersionUrl}AssistanceRequest/GetAllAssistanceRequests`
    ).pipe(
      map(res => {
        const matching = res.data?.find((req: any) => req.inKindDonationId === inKindDonationId);
        return matching || null;
      })
    );
  }

  GetPaginatedByRequestStatus(
    isInKind: boolean,
    requestStatus: number,
    pageNumber: number,
    pageSize: number,
    orderByDirection: number = 1
  ): Observable<any> {
    return this._HttpClient.get(`${Environment.baseUrl}${Environment.VersionUrl}AssistanceRequest/GetPaginatedByRequestStatus`, {
      params: {
        isInKind: isInKind ? 'true' : 'false',
        requestStatus,
        pageNumber,
        pageSize,
        orderByDirection
      }
    });
  }

}
