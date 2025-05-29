import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Environment } from '../../../../../Auth/core/Environment/Environment';

@Injectable({
  providedIn: 'root'
})
export class VolunteerActivityssService {

    private readonly _HttpClient = inject(HttpClient);
      GetProjectsPaginatedByRequestStatus(requestStatus:number,pageNumber: number, pageSize: number,  orderByDirection: number = 1):Observable<any>{
        return this._HttpClient.get<any>(`${Environment.baseUrl}${Environment.VersionUrl}VolunteerApplication/GetProjectsPaginatedByRequestStatus?requestStatus=${requestStatus}&pageNumber=${pageNumber}&pageSize=${pageSize}&orderByDirection=${orderByDirection}`)
        } 
        GetActivitiesPaginatedByRequestStatus(requestStatus:number,pageNumber: number, pageSize: number,  orderByDirection: number = 1):Observable<any>{
          return this._HttpClient.get<any>(`${Environment.baseUrl}${Environment.VersionUrl}VolunteerApplication/GetActivitiesPaginatedByRequestStatus?requestStatus=${requestStatus}&pageNumber=${pageNumber}&pageSize=${pageSize}&orderByDirection=${orderByDirection}`)
          }
        GetProjectById(projectId: string): Observable<any> {
          return this._HttpClient.get<any>(`${Environment.baseUrl}${Environment.VersionUrl}Project/GetProjectById?id=${projectId}`);
          }
        GetUserById(userId: string): Observable<any> {
          return this._HttpClient.get<any>(`${Environment.baseUrl}${Environment.VersionUrl}User/GetUserById?id=${userId}`);
          }
        UpdateVolunteerStatus(volunteerApplication: { id: string, volunteerId: string, requestDetails: string | null, 
          projectId:string,volunteerActivityId: string, requestStatus: number }): Observable<any> {
    return this._HttpClient.put<any>(`${Environment.baseUrl}${Environment.VersionUrl}VolunteerApplication/UpdateVolunteerApplication`, volunteerApplication);
  }
  GetVolunteerActivityById(volunteerActivityId: string): Observable<any> {
    return this._HttpClient.get<any>(`${Environment.baseUrl}${Environment.VersionUrl}VolunteerActivity/GetVolunteerActivityById?id=${volunteerActivityId}`);
    }
}
