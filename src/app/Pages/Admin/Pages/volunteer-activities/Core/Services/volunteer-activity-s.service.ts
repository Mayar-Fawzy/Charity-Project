import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Environment } from '../../../../../Auth/core/Environment/Environment';
import { ResCrud } from '../../../projects/Core/InterFace/res-crud';
import { IGetPaginatedVolunteerActivities, ICreateVolunteerActivity, IUpdateVolunteerActivity } from '../Interfaces/volunter-activity';

@Injectable({
  providedIn: 'root'
})
export class VolunteerActivitySService {
  private readonly _HttpClient = inject(HttpClient);

  GetPaginatedVolunteerActivities(pageNumber: number, pageSize: number, orderByDirection: number = 1): Observable<IGetPaginatedVolunteerActivities> {
    return this._HttpClient.get<IGetPaginatedVolunteerActivities>(
      `${Environment.baseUrl}${Environment.VersionUrl}VolunteerActivity/GetPaginatedVolunteerActivities?pageNumber=${pageNumber}&pageSize=${pageSize}&orderByDirection=${orderByDirection}`
    );
  }

  Delete(id: string): Observable<any> {
    return this._HttpClient.delete<any>(
      `${Environment.baseUrl}${Environment.VersionUrl}VolunteerActivity/DeleteVolunteerActivity?id=${id}`
    );
  }

  CreateVolunteerActivity(data: ICreateVolunteerActivity): Observable<any> {
    return this._HttpClient.post<any>(
      `${Environment.baseUrl}${Environment.VersionUrl}VolunteerActivity/CreateVolunteerActivity`,
      data
    );
  }

  UpdateProject(data: IUpdateVolunteerActivity): Observable<ResCrud> {
    return this._HttpClient.put<ResCrud>(
      `${Environment.baseUrl}${Environment.VersionUrl}VolunteerActivity/UpdateVolunteerActivity`,
      data
    );
  }

  GetVolunteerActivityById(id: string): Observable<any> {
    return this._HttpClient.get<any>(
      `${Environment.baseUrl}${Environment.VersionUrl}VolunteerActivity/GetVolunteerActivityById?id=${id}`
    );
  }
}