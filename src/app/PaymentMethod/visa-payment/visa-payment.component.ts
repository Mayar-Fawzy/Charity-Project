import { Component, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { loadStripe } from '@stripe/stripe-js';

@Component({
  selector: 'app-visa-payment',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './visa-payment.component.html',
  styleUrls: ['./visa-payment.component.scss']
})
export class VisaPaymentComponent implements AfterViewInit {
  clientSecret: string = '';
  stripePromise = loadStripe('pk_test_51RTUHXPKYzSs7mCoazO7RkxzhimYNekbLYMr9FqC42ZdGbrZ0pFJs8brQaGUQiFoSp0TZqraxSB7xERUGnvYAsYv00BsvlYtP6');

  constructor(private router: Router) {
  const navigation = this.router.getCurrentNavigation();
  const state = navigation?.extras.state as { clientSecret: string };
  this.clientSecret = state?.clientSecret || '';
}

async ngAfterViewInit() {
  const stripe = await this.stripePromise;
  if (!stripe || !this.clientSecret) {
    alert('حدث خطأ في إعداد الدفع.');
    return;
  }

  const elements = stripe.elements();
  const card = elements.create('card');
  card.mount('#card-element');

  (this as any).card = card;
  (this as any).stripe = stripe;
}

async submitPayment() {
  const stripe = (this as any).stripe;
  const card = (this as any).card;

  if (!stripe || !card) {
    alert('لم يتم تهيئة عناصر الدفع.');
    return;
  }

  const { error, paymentIntent } = await stripe.confirmCardPayment(this.clientSecret, {
    payment_method: {
      card: card
    }
  });

  if (error) {
    alert('فشل الدفع: ' + error.message);
  } else if (paymentIntent && paymentIntent.status === 'succeeded') {
    alert('تم الدفع بنجاح!');
  }
}
}
