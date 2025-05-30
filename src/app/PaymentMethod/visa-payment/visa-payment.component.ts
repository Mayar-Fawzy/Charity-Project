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
export class VisaPaymentComponent implements OnInit {
  clientSecret: string = '';
  stripePromise = loadStripe('pk_test_XXXXXXXXXXXXXXXXXXXXXXXX'); // ضع المفتاح الصحيح هنا

  constructor(private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { clientSecret: string };
    this.clientSecret = state?.clientSecret || '';
  }

  async ngOnInit() {
    const stripe = await this.stripePromise;
    if (!stripe || !this.clientSecret) {
      alert('حدث خطأ في إعداد الدفع.');
      return;
    }

    const elements = stripe.elements();
    const card = elements.create('card');
    card.mount('#card-element');

    const form = document.getElementById('payment-form');
    form?.addEventListener('submit', async (event) => {
      event.preventDefault();

      const { error, paymentIntent } = await stripe.confirmCardPayment(this.clientSecret, {
        payment_method: {
          card: card
        }
      });

      if (error) {
        alert('فشل الدفع: ' + error.message);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        alert('تم الدفع بنجاح!');
        // توجيه المستخدم أو تنفيذ أي إجراء بعد النجاح
      }
    });
  }
}
