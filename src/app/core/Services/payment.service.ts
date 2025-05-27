import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
private apiUrl = 'https://givinghandcharity.runasp.net/api/v1/Payment/CreatePaymentIntent';

  constructor(private http: HttpClient) {}


  createPaymentIntent(amount: number, donorId: string, projectId: string): Observable<any> {
    let params = new HttpParams()
      .set('amount', amount.toString())
      .set('donorId', donorId)
      .set('projectId', projectId);

    // إرسال الطلب
    return this.http.post(this.apiUrl, {}, {  params });
  }
}
