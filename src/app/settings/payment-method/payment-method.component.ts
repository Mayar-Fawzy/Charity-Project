import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RoutingModule } from '../../core/Shared/Models/routing/routing.module';
import { LoginService } from '../../Pages/Auth/core/Services/login.service';
import { Router } from '@angular/router';
import { PaymentService } from '../../core/Services/payment.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-payment-method',
  standalone: true,
  imports: [CommonModule, RoutingModule, FormsModule, ReactiveFormsModule],
  templateUrl: './payment-method.component.html',
  styleUrls: ['./payment-method.component.scss']
})
export class PaymentMethodComponent {
  private readonly _Router = inject(Router);
  private readonly _PaymentService = inject(PaymentService);
  private readonly _LoginService = inject(LoginService);

  donorId = this._LoginService.donorId;
  amount: number = 0;

  setAmount(value: number): void {
    this.amount = value;
    this.validateAmount();
  }

  validateAmount(): void {
    // No need to enforce amount here since the button is disabled via [disabled]="amount < 25"
    // This method can be used for additional validation or user feedback if needed
    if (this.amount < 0) {
      this.amount = 0; // Prevent negative values
    }
  }

  onDonateNow(): void {
    const token = localStorage.getItem('userToken');

    if (!token) {
      Swal.fire({
        icon: 'warning',
        title: 'خطأ',
        text: 'يجب عليك التسجيل أولًا قبل التبرع',
        confirmButtonColor: '#f6a026',
        confirmButtonText: 'حسنا',
      }).then(() => {
        this._Router.navigate(['/login']);
      });
      return;
    }

    this._PaymentService.createPaymentIntent(this.amount, this.donorId, ' ')
      .subscribe({
        next: (res) => {
          console.log('PaymentIntent created:', res);
          this._Router.navigate(['GenralVisa', this.donorId], { state: { clientSecret: res.data } });
        },
        error: (err) => {
          console.error('فشل إنشاء PaymentIntent:', err);
          Swal.fire({
            icon: 'error',
            title: 'حدث خطأ',
            text: 'فشل إنشاء PaymentIntent: ' + err.message,
            confirmButtonColor: '#f6a026',
            confirmButtonText: 'حسنا',
          });
        },
      });
  }
}