import { Component, OnInit, inject } from '@angular/core';
import { HomedonateServiesService } from '../../Pages/Donor/core/Services/homedonate-servies.service';
import { loadStripe } from '@stripe/stripe-js';

import { ActivatedRoute, Router } from '@angular/router';
import { Data } from '../../Pages/Donor/core/interface/iproject-donate';
import { LoginService } from '../../Pages/Auth/core/Services/login.service';
import { PaymentService } from '../../core/Services/payment.service';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-ewallet-payment',
  standalone: true,
  templateUrl: './ewallet-payment.component.html',
  styleUrls: ['./ewallet-payment.component.scss'],
  imports: [FormsModule],
})
export class EwalletPaymentComponent implements OnInit {
  private readonly _HomedonateServiesService = inject(HomedonateServiesService);
  private readonly _ActivatedRoute = inject(ActivatedRoute);
  private readonly _PaymentService = inject(PaymentService);
  private readonly _LoginService = inject(LoginService);
  private readonly _Router=inject(Router)
  donorId = this._LoginService.donorId;
  projectId: string | null = null;
  project: any | null = null;
name: string = '';
  amount: number = 0;
  phone: string = '';

  ngOnInit(): void {
    this.projectId = this._ActivatedRoute.snapshot.paramMap.get('id');
    if (this.projectId) {
      this._HomedonateServiesService.getProjectById(this.projectId).subscribe({
        next: (res) => {
       if (res.isSucceeded && res.data) {
            this.project = res.data; // res.data هو كائن وليس مصفوفة
            this.name = this.project?.name ?? 'غير متوفر';
          } else {
            this.name = 'لا يوجد اسم متاح';
          }
        },
        error: (err) => {
          console.error('فشل في تحميل بيانات المشروع', err);
        }
      });
    }
  }

 onDonateNow(): void {
  if (!this.amount || !this.donorId || !this.projectId) {
    alert('يرجى إدخال المبلغ والتأكد من تسجيل الدخول.');
    return;
  }

  this._PaymentService.createPaymentIntent(this.amount, this.donorId, this.projectId)
    .subscribe({
      next: (res) => {
        console.log('PaymentIntent created:', res);
        Swal.fire({
                  icon: "success",
                  title: "تم إنشاء طلب الدفع بنجاح!",
                  confirmButtonColor: "#f6a026",
                  confirmButtonText: "حسنا",
                }).then(() => {
           this._Router.navigate(['visa-payment', this.projectId], 
          { state: { clientSecret: res.data } });
        });
       
      },
      error: (err) => {
        console.error('فشل إنشاء PaymentIntent:', err);
        alert('حدث خطأ أثناء إنشاء الدفع.');
        Swal.fire({
                  icon: "error",
                  title: "حدث خطأ",
                  text: 'فشل إنشاء PaymentIntent'+err,
                  confirmButtonColor: "#f6a026",
                  confirmButtonText: "حسنا",
                })
      }
    });
}
}
