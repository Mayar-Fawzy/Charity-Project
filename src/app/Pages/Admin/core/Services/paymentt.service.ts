import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Environment } from '../../../Auth/core/Environment/Environment';

@Injectable({
  providedIn: 'root'
})
export class PaymenttService {
private apiUrl = 'https://givinghandcharity.runasp.net/api/v1/Payment/CreatePaymentIntent';


  constructor(private http: HttpClient) {}

  createPaymentIntent(amount: number, donorId: string, projectId: string) {
    const params = new HttpParams()
      .set('amount', amount.toString())
      .set('donorId', donorId)
      .set('projectId', projectId);

    return this.http.post<{ data: string }>(`${Environment.baseUrl}${Environment.VersionUrl}Payment/CreatePaymentIntent`, null, { params });
  }
}

