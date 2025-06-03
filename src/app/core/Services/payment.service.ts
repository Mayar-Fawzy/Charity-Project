import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
private apiUrl = 'https://givinghandcharity.runasp.net/api/v1/Payment/CreatePaymentIntent';

  constructor(private http: HttpClient) {}


  createPaymentIntent(amount: number, donorId: string, projectId: string|null): Observable<any> {
    let params = new HttpParams()
      .set('amount', amount.toString())
      .set('donorId', donorId)
      .set('projectId', projectId? projectId : 'null'); // إذا كان project

    // إرسال الطلب
    return this.http.post(this.apiUrl, {}, {  params });
  }
}
