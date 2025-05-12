import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { observableToBeFn } from 'rxjs/internal/testing/TestScheduler';
import { Observable } from 'rxjs';
import { Environment } from '../../../../../Auth/core/Environment/Environment';
import { IGetProj } from '../InterFace/iget-proj';

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
}
