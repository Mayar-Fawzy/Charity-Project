import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';

@Component({
  selector: 'app-visa-payment',
  standalone: true,
  imports: [],
  templateUrl: './visa-payment.component.html',
  styleUrls: ['./visa-payment.component.scss']
})
export class VisaPaymentComponent   {
  clientSecret: string = '';
  stripePromise = loadStripe(`pk_test_51RTUHXPKYzSs7mCoazO7RkxzhimYNekbLYMr9FqC42ZdGbrZ0pFJs8brQaGUQiFoSp0TZqraxSB7xERUGnvYAsYv00BsvlYtP6` ); // ضع المفتاح الصحيح هنا

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

  const elements = stripe.elements();         // ⬅️ أنشئ عناصر Stripe
  const card = elements.create('card');       // ⬅️ أنشئ العنصر card
  card.mount('#card-element');                // ⬅️ زرعه في div#card-element

  const form = document.getElementById('payment-form');
  form?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const { error, paymentIntent } = await stripe.confirmCardPayment(this.clientSecret, {
      payment_method: {
        card: card
      }
    });

    if (error) {
      alert('فشل الدفع: ' + error.message); // ← استخدم error.message
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      alert('تم الدفع بنجاح!');
    }
  });
}

}
