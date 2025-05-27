import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import { HomedonateServiesService } from '../../Pages/Donor/core/Services/homedonate-servies.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Data } from '../../Pages/Donor/core/interface/iproject-donate';
import { PaymentService } from '../../core/Services/payment.service';
import { LoginService } from '../../Pages/Auth/core/Services/login.service';
import Swal from 'sweetalert2';

declare var Stripe: any;

@Component({
  selector: 'app-ewallet-payment',
  standalone: true,
  imports: [],
  templateUrl: './ewallet-payment.component.html',
  styleUrls: ['./ewallet-payment.component.scss']
})
export class EwalletPaymentComponent implements OnInit {
  dataaa!: any;
  private readonly _HomedonateServiesService = inject(HomedonateServiesService);
  private readonly _ActivatedRoute = inject(ActivatedRoute);
  private readonly paymentService = inject(PaymentService);
  private readonly _LoginService = inject(LoginService);
  private readonly _Router = inject(Router);
  projects: Data[] = [];
  @ViewChild('amountInput') amountInput!: ElementRef;
  @ViewChild('cardElement') cardElement!: ElementRef;
  stripe: any;
  elements: any;
  clientSecret: string = '';

  ngOnInit(): void {
    const projectId = this._ActivatedRoute.snapshot.paramMap.get('id');
    if (projectId) {
      this._HomedonateServiesService.getProjectById(projectId).subscribe({
        next: (res) => {
          this.projects = Array.isArray(res.data) ? res.data : [res.data]; // Ensure projects is an array
        },
        error: (err) => {
          console.error('فشل في تحميل بيانات المشروع', err);
          Swal.fire({
            icon: 'error',
            title: 'خطأ',
            text: 'فشل في تحميل بيانات المشروع. حاول مرة أخرى.',
            confirmButtonColor: '#f6a026',
            confirmButtonText: 'حسنا'
          });
        }
      });
    }
    this.stripe = Stripe(this.dataaa); // Replace with your Stripe Publishable Key
    this.elements = this.stripe.elements();
    const card = this.elements.create('card');
    if (this.cardElement) {
      card.mount(this.cardElement.nativeElement);
    }
  }

  createPayment() {
    const amount = +this.amountInput.nativeElement.value || 500;
    const donorId = this._LoginService.donorId;
    const projectId = this._ActivatedRoute.snapshot.paramMap.get('id') || '';

    if (!donorId) {
      Swal.fire({
        icon: 'warning',
        title: 'خطأ',
        text: 'يجب تسجيل الدخول أولاً',
        confirmButtonColor: '#f6a026',
        confirmButtonText: 'حسنا'
      });
      this._Router.navigate(['/login']);
      return;
    }

    this.paymentService.createPaymentIntent(amount, donorId, projectId).subscribe({
      next: (res) => {
        console.log('Payment Intent created:', res);
        this.dataaa= res.data;
        if (res.isSuccessed && res.data) {
          this.clientSecret = res.data;
          this.stripe.confirmCardPayment(this.clientSecret, {
            payment_method: {
              card: this.elements.getElement('card')
            }
          }).then((result: any) => {
            if (result.error) {
              Swal.fire({
                icon: 'error',
                title: 'فشل الدفع',
                text: result.error.message,
                confirmButtonColor: '#f6a026',
                confirmButtonText: 'حسنا'
              });
            } else {
              Swal.fire({
                icon: 'success',
                title: 'نجح الدفع',
                text: 'تم الدفع بنجاح!',
                confirmButtonColor: '#f6a026',
                confirmButtonText: 'حسنا'
              });
              this._Router.navigate(['/payment-confirmation', projectId]);
            }
          });
        }
      },
      error: (err) => {
        console.error('Error:', err);
        Swal.fire({
          icon: 'error',
          title: 'فشل الدفع',
          text: 'حدث خطأ أثناء معالجة الدفع. حاول مرة أخرى.',
          confirmButtonColor: '#f6a026',
          confirmButtonText: 'حسنا'
        });
      }
    });
  }
}