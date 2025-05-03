import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IprojectDonate } from '../../../Donor/core/interface/iproject-donate';
import { Environment } from '../../../Auth/core/Environment/Environment';


@Injectable({
  providedIn: 'root'
})
export class ProjectService {
 constructor() { }
  private readonly _HttpClient = inject(HttpClient);
  GetDonation():Observable<IprojectDonate>{
    return this._HttpClient.get<IprojectDonate>(`${Environment.baseUrl}${Environment.VersionUrl}Project/GetAllProjects`)
  }
  getProjectById(id: string): Observable<IprojectDonate>{
    return this._HttpClient.get<IprojectDonate>(`${Environment.baseUrl}${Environment.VersionUrl}/GetProjectById?id=${id}`);
  }
}
