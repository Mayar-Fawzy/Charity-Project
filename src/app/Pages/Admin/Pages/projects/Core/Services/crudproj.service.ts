import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { observableToBeFn } from 'rxjs/internal/testing/TestScheduler';
import { Observable } from 'rxjs';
import { Environment } from '../../../../../Auth/core/Environment/Environment';
import { IGetProj } from '../InterFace/iget-proj';
import { IAddProj } from '../InterFace/iadd-proj';
import { IEditProj } from '../InterFace/iedit-proj';
import { ResCrud } from '../InterFace/res-crud';
import { ProjId } from '../InterFace/proj-id';

@Injectable({
  providedIn: 'root'
})
export class CRUDProjService {
   
    private readonly _HttpClient = inject(HttpClient);
    GetPaginatedProjects(pageNumber:number,pageSize:number,orderByDirection:number=1):Observable<IGetProj>{
        return this._HttpClient.get<IGetProj>(`${Environment.baseUrl}${Environment.VersionUrl}Project/GetPaginatedProjects?pageNumber=${pageNumber}&pageSize=${pageSize}&orderByDirection=${orderByDirection}`)
      } 
      Delete(id:string):Observable<IGetProj>{
        return this._HttpClient.delete<IGetProj>(`${Environment.baseUrl}${Environment.VersionUrl}Project/DeleteProject?id=${id}`)
      }
      CreateProject(formData: FormData):Observable<ResCrud>{
           return this._HttpClient.post<ResCrud>(`${Environment.baseUrl}${Environment.VersionUrl}Project/CreateProject`,formData)
      }
      UpdateProject(id:string,formData: FormData):Observable<ResCrud>{
        return this._HttpClient.put<ResCrud>(`${Environment.baseUrl}${Environment.VersionUrl}Project/UpdateProject?id=${id}`,formData)
      }
      GetProjectById(id:string):Observable<ProjId>{
        return this._HttpClient.get<ProjId>(`${Environment.baseUrl}${Environment.VersionUrl}Project/GetProjectById?id=${id}`)
      }
}
