import { Component, inject } from '@angular/core';
import Swal from 'sweetalert2';
import { HomedonateServiesService } from '../../Pages/Donor/core/Services/homedonate-servies.service';
import { ActivatedRoute, Router } from '@angular/router';
import { loadStripe } from '@stripe/stripe-js';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-general-visa',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './general-visa.component.html',
  styleUrl: './general-visa.component.scss'
})
export class GeneralVisaComponent {
 private readonly _router=inject(Router);
  clientSecret: string = '';
  postalCode: string = '';
  stripePromise = loadStripe('pk_test_51Qusj5GghqEuY6PRxD7MnEaGXKKoCwDmrcgr24GCb5XgsGl6Yfzlx2rgaCJTEPWarztiPJP3X7R4BtWGFu4oC2re002PjOUT4D');

  constructor(private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { clientSecret: string };
    this.clientSecret = state?.clientSecret || '';
  }

  async ngAfterViewInit() {
    const stripe = await this.stripePromise;
    if (!stripe || !this.clientSecret) { 
      Swal.fire({
                  icon: "error",
                  title: "حدث خطأ",
                  text: 'فشل الدفع ',
                  confirmButtonColor: "#f6a026",
                  confirmButtonText: "حسنا",
                // }).then(() => {
                //   this._router.navigate(['/home', this.projectId]);
                }
                );
      return;
    }

    const elements = stripe.elements();

    const cardNumber = elements.create('cardNumber');
    const cardExpiry = elements.create('cardExpiry');
    const cardCvc = elements.create('cardCvc');

    cardNumber.mount('#card-number-element');
    cardExpiry.mount('#card-expiry-element');
    cardCvc.mount('#card-cvc-element');

    (this as any).stripe = stripe;
    (this as any).cardNumber = cardNumber;
    (this as any).cardExpiry = cardExpiry;
    (this as any).cardCvc = cardCvc;
  }

  async submitPayment() {
  const stripe = (this as any).stripe;
  const cardNumber = (this as any).cardNumber;
  const cardExpiry = (this as any).cardExpiry;
  const cardCvc = (this as any).cardCvc;

  if (!stripe || !cardNumber || !cardExpiry || !cardCvc) {
    alert('لم يتم تهيئة عناصر الدفع.');
    return;
  }

  const { error, paymentIntent } = await stripe.confirmCardPayment(this.clientSecret, {
    payment_method: {
      card: cardNumber,
      billing_details: {
        // لا ترسل postal_code هنا
      }
    }
  });

  if (error) {
       Swal.fire({
                  icon: "error",
                  title: "حدث خطأ",
                  text: 'فشل الدفع '+error.message,
                  confirmButtonColor: "#f6a026",
                  confirmButtonText: "حسنا",
                }).then(() => {
                  this._router.navigate(['/home']);});
    
  } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      Swal.fire({
                  icon: "success",
                  title: " تم التبرع بنجاح ",
                  confirmButtonColor: "#f6a026",
                  confirmButtonText: "حسنا",
                }).then(() => {
           this._router.navigate(['home']);
        
        });
  }
}
}
