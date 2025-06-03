import { LoginService } from './../../Pages/Auth/core/Services/login.service';
import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  ViewChild
} from '@angular/core';
import {
  loadStripe,
  Stripe,
  StripeElements,
  StripeCardNumberElement,
  StripeCardExpiryElement,
  StripeCardCvcElement,
  StripeElement
} from '@stripe/stripe-js';
import {  FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { PaymentService } from '../../core/Services/payment.service';
import { Environment } from '../../Pages/Auth/core/Environment/Environment';
import { HomedonateServiesService } from '../../Pages/Donor/core/Services/homedonate-servies.service';
import { ProfileservicesService } from '../Core/Services/profileservices.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment-method',
  templateUrl: './payment-method.component.html',
  styleUrls: ['./payment-method.component.scss'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule]
})
export class PaymentMethodComponent implements AfterViewInit {
  private readonly _router = inject(Router);
  private readonly _paymentService = inject(PaymentService);
  private readonly _profile = inject(ProfileservicesService);
  private readonly _LoginService = inject(LoginService);
  private readonly _ActivatedRoute = inject(ActivatedRoute);

  @ViewChild('paymentForm') paymentForm: any;

  clientSecret: string = '';
  postalCode: string = '';
  project: any | null = null;
  name: string = '';
  paymentStatus: string = '';
  amount: number = 0;
  cardHolder: string = ''; // Will be populated from GetUserById
  isLoading: boolean = false;
  stripePromise = loadStripe(Environment.puplishKey);

  ngOnInit(): void {
    this._profile.GetUserById(this._LoginService.donorId).subscribe({
      next: (res) => {
        this.cardHolder = res.data.firstName+" "+res.data.lastName; 
      },
      error: (err) => {
        console.error('فشل في تحميل بيانات المستخدم', err);
        this.paymentStatus = 'فشل في تحميل بيانات المستخدم.';
        Swal.fire({
          icon: 'error',
          title: 'حدث خطأ',
          text: this.paymentStatus,
          confirmButtonColor: '#f6a026',
          confirmButtonText: 'حسنا',
        });
      }
    });
  }

  async ngAfterViewInit() {
    const stripe = await this.stripePromise;
    if (!stripe) {
      this.paymentStatus = 'فشل في تحميل سكربت Stripe. تحقق من المفتاح أو الاتصال بالإنترنت.';
      Swal.fire({
        icon: 'error',
        title: 'حدث خطأ',
        text: this.paymentStatus,
        confirmButtonColor: '#f6a026',
        confirmButtonText: 'حسنا',
      });
      return;
    }

    const elements = stripe.elements();

    const cardNumber = elements.create('cardNumber') as StripeCardNumberElement;
    const cardExpiry = elements.create('cardExpiry') as StripeCardExpiryElement;
    const cardCvc = elements.create('cardCvc') as StripeCardCvcElement;

    cardNumber.mount('#card-number-element');
    cardExpiry.mount('#card-expiry-element');
    cardCvc.mount('#card-cvc-element');

    (this as any).stripe = stripe;
    (this as any).cardNumber = cardNumber;
    (this as any).cardExpiry = cardExpiry;
    (this as any).cardCvc = cardCvc;

    cardNumber.on('change', (event: any) => {
      if (event.error) {
        this.paymentStatus = event.error.message || '';
      } else {
        this.paymentStatus = '';
      }
    });
  }

  

 isFormValid(): boolean {
  return this.paymentForm?.valid && this.amount >= 25;
}


  async submitPayment(): Promise<void> {
    this.isLoading = true;

    const stripe = (this as any).stripe as Stripe;
    const cardNumber = (this as any).cardNumber as StripeCardNumberElement;
    const cardExpiry = (this as any).cardExpiry as StripeCardExpiryElement;
    const cardCvc = (this as any).cardCvc as StripeCardCvcElement;

    if (!stripe || !cardNumber || !cardExpiry || !cardCvc) {
      this.isLoading = false;
      this.paymentStatus = 'لم يتم تهيئة عناصر الدفع.';
      Swal.fire({
        icon: 'error',
        title: 'حدث خطأ',
        text: this.paymentStatus,
        confirmButtonColor: '#f6a026',
        confirmButtonText: 'حسنا',
      });
      return;
    }

    if (!this.isFormValid()) {
      this.isLoading = false;
      Swal.fire({
        icon: 'error',
        title: 'بيانات غير صحيحة',
        text: 'يرجى التأكد من تعبئة جميع الحقول بشكل صحيح وأن المبلغ لا يقل عن 25 جنيهًا.',
        confirmButtonColor: '#f6a026',
        confirmButtonText: 'حسنا',
      });
      return;
    }

    if (!this.clientSecret && this._LoginService.donorId) {
      this._paymentService.createPaymentIntent(this.amount, this._LoginService.donorId, null).subscribe({
        next: (res) => {
          if (res.isSucceeded && res.data) {
            this.clientSecret = res.data;
            this.processPayment(stripe, cardNumber);
          } else {
            this.isLoading = false;
            this.paymentStatus = 'فشل في إنشاء PaymentIntent.';
            Swal.fire({
              icon: 'error',
              title: 'حدث خطأ',
              text: this.paymentStatus,
              confirmButtonColor: '#f6a026',
              confirmButtonText: 'حسنا',
            });
          }
        },
        error: (err) => {
          this.isLoading = false;
          console.error('فشل إنشاء PaymentIntent:', err);
          this.paymentStatus = 'فشل في إنشاء PaymentIntent: ' + err.message;
          Swal.fire({
            icon: 'error',
            title: 'حدث خطأ',
            text: this.paymentStatus,
            confirmButtonColor: '#f6a026',
            confirmButtonText: 'حسنا',
          });
        }
      });
    } else if (this.clientSecret) {
      this.processPayment(stripe, cardNumber);
    } else {
      this.isLoading = false;
      this.paymentStatus = 'لم يتم توفير clientSecret.';
      Swal.fire({
        icon: 'error',
        title: 'حدث خطأ',
        text: this.paymentStatus,
        confirmButtonColor: '#f6a026',
        confirmButtonText: 'حسنا',
      });
    }
  }

  async processPayment(stripe: Stripe, cardNumber: StripeCardNumberElement): Promise<void> {
    const { error, paymentIntent } = await stripe.confirmCardPayment(this.clientSecret, {
      payment_method: {
        card: cardNumber,
       
      }
    });

    if (error) {
      this.isLoading = false;
      this.paymentStatus = 'فشل الدفع: ' + (error.message || 'خطأ غير معروف');
      Swal.fire({
        icon: 'error',
        title: 'حدث خطأ',
        text: this.paymentStatus,
        confirmButtonColor: '#f6a026',
        confirmButtonText: 'حسنا',
      }
      ).then(() => {
        this.resetFormFields();
        });
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      this.isLoading = false;
      this.paymentStatus = `تم التبرع بنجاح بمبلغ ${this.amount}جنيهًا `
      Swal.fire({
        icon: 'success',
        title: 'نجاح',
        text: this.paymentStatus,
        confirmButtonColor: '#f6a026',
        confirmButtonText: 'حسنا',
      }
      ).then(() => {
      this.resetFormFields();
      });
    }
  }
  resetFormFields(): void {
  // إعادة تعيين المتغيرات المرتبطة بالحقول
  this.amount = 0;

  // إعادة تعيين نموذج Angular
  this.paymentForm?.resetForm();

  // إعادة تعيين عناصر Stripe (تمسح بيانات الكارت)
  const cardNumber = (this as any).cardNumber as StripeCardNumberElement;
  const cardExpiry = (this as any).cardExpiry as StripeCardExpiryElement;
  const cardCvc = (this as any).cardCvc as StripeCardCvcElement;

  if (cardNumber) cardNumber.clear();
  if (cardExpiry) cardExpiry.clear();
  if (cardCvc) cardCvc.clear();

  // إعادة تعيين clientSecret حتى لا يعاد الدفع بنفس الـ intent
  this.clientSecret = '';
}

}