import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Environment } from '../../../Auth/core/Environment/Environment';
import { IprojectDonate } from '../../../Donor/core/interface/iproject-donate';

import { HttpClient } from '@angular/common/http';
import { VolnteerAssistanceRequest } from '../Interface/volnteer-assistance-request';

@Injectable({
  providedIn: 'root'
})
export class VolunteerActivityReqService {
  private readonly _HttpClient = inject(HttpClient);

  createVolunteerApplication(data: VolnteerAssistanceRequest): Observable<IprojectDonate> {
    return this._HttpClient.post<IprojectDonate>(
      `${Environment.baseUrl}${Environment.VersionUrl}AssistanceRequest/CreateAssistanceRequest`,
      data
    );
  }
}