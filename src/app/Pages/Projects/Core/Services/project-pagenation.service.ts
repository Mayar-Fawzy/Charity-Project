import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Environment } from '../../../Auth/core/Environment/Environment';
import { IprojectDonate } from '../../../Donor/core/interface/iproject-donate';

@Injectable({
  providedIn: 'root'
})
export class ProjectPagenationService {

 constructor() { }
  private readonly _HttpClient = inject(HttpClient);
  GetPaginatedProjects(pageNumber:number,pageSize:number,orderByDirection:number=1):Observable<IprojectDonate>{
    return this._HttpClient.get<IprojectDonate>(`${Environment.baseUrl}${Environment.VersionUrl}Project/GetPaginatedProjects?pageNumber=${pageNumber}&pageSize=${pageSize}&orderByDirection=${orderByDirection}`)
  }
  getProjectById(id: string): Observable<IprojectDonate>{
    return this._HttpClient.get<IprojectDonate>(`${Environment.baseUrl}${Environment.VersionUrl}/GetProjectById?id=${id}`);
  }
}
