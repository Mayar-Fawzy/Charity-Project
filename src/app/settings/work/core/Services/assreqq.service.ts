import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Environment } from '../../../../Pages/Auth/core/Environment/Environment';

@Injectable({
  providedIn: 'root'
})
export class AssreqqService {
 private readonly _HttpClient = inject(HttpClient);

  GetAllAssistanceRequestsById(beneficiaryId: string):Observable<any> {
    return this._HttpClient.get(`${Environment.baseUrl}${Environment.VersionUrl}AssistanceRequest/GetAllAssistanceRequestsById?beneficiaryId=${beneficiaryId}`);
  }
}
