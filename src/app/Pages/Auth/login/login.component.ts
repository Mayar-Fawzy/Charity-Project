import { CommonModule, NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule, NgModel } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from '../core/Services/login.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: [
    '../../../core/Shared/Css/ToastDesign.scss',
    '../core/Shared/Shared.scss',
    './login.component.scss',
  ],
})
export class LoginComponent {
  private readonly _LoginService = inject(LoginService);
  private readonly _Router = inject(Router);
  private readonly _ToastService = inject(ToastrService);

  role!: any;
  isloading = false;
  passwordFieldType: boolean = true;


  emailDomainTypoValidator(): Validators {
    const commonTypos = ['gmai.com', 'gnail.com', 'yahho.com', 'hotnail.com', 'outlok.com'];
    return (control: FormControl): { [key: string]: boolean } | null => {
      const email = control.value;
      if (!email) return null;
      const domain = email.substring(email.lastIndexOf('@') + 1).toLowerCase();
      if (commonTypos.includes(domain)) {
        return { domainTypo: true };
      }
      return null;
    };
  }

  siginForm: FormGroup = new FormGroup({
    email: new FormControl(null, [
      Validators.required,
      Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    ]),
    password: new FormControl(null, [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/),
    ]),
  });

  CheckFieldInvalid(InputName: string): boolean {
    const Check = this.siginForm.get(InputName);
    return Check ? Check.invalid && (Check.touched || Check.dirty) : false;
  }

  CheckFieldValid(InputName: string): boolean {
    const Check = this.siginForm.get(InputName);
    return Check ? Check.valid && (Check.touched || Check.dirty) : false;
  }

  Sigin(formInfo: FormGroup) {
    this.isloading = true;
    this._LoginService.login(formInfo.value).subscribe(
      (res) => {
        this.isloading = true;
        console.log('resLogin', res);

        if (res.isSucceeded) {


          localStorage.setItem('userToken', res.data.jwtModel.jwt);
          localStorage.setItem('expdate', JSON.stringify(res.data.jwtModel.jwtExpireDate));





          // #endregion

          this._LoginService.saveUserAuth();
          if (formInfo.value.email == 'givinghands.contact@gmail.com' && formInfo.value.password == '1Q2w3e4@') {
            this._Router.navigate(['/admin']);
          }
          else {
            this.isloading = true;
            this._ToastService.success('تم تسجيل الدخول بنجاح', '', { timeOut: 3000 });
            this._Router.navigate(['/home']);
          }
        }
      },
      (error) => {
        this.isloading = false;
        console.log('error', error);
        this._ToastService.error(error.error.errors, 'error');
      }
    );
  }
  showPasswordLogin = false;

  togglePasswordVisibilityLogin() {
    this.showPasswordLogin = !this.showPasswordLogin;

  }
}
