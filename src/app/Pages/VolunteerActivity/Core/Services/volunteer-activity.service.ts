import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IvolunteerActivity } from '../InterFace/ivolunteer-activity';
import { Environment } from '../../../Auth/core/Environment/Environment';

@Injectable({
  providedIn: 'root'
})
export class VolunteerActivityService {
  constructor() { }
    private readonly _HttpClient = inject(HttpClient);
    GetPaginatedVolunteerActivity(pageNumber:number,pageSize:number,orderByDirection:number=1):Observable<IvolunteerActivity>{
      return this._HttpClient.get<IvolunteerActivity>(`${Environment.baseUrl}${Environment.VersionUrl}VolunteerActivity/GetPaginatedVolunteerActivities?pageNumber=${pageNumber}&pageSize=${pageSize}&orderByDirection=${orderByDirection}`)
    }
    getVolunteerActivityById(id: string): Observable<IvolunteerActivity>{
      return this._HttpClient.get<IvolunteerActivity>(`${Environment.baseUrl}${Environment.VersionUrl}VolunteerActivity/GetVolunteerActivityById?id=${id}`);
    }
}
