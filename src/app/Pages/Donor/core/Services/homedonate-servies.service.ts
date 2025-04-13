import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { IprojectDonate } from '../interfaces/iproject-donate';
import { Observable } from 'rxjs';
import { Environment } from '../../../Auth/core/Environment/Environment';

@Injectable({
  providedIn: 'root'
})
export class HomedonateServiesService {
  
    private readonly _HttpClient = inject(HttpClient);
      GetDonation():Observable<IprojectDonate>{
        return this._HttpClient.get<IprojectDonate>(`${Environment.baseUrl}${Environment.VersionUrl}Project/GetAllProjects`)
      }
}
