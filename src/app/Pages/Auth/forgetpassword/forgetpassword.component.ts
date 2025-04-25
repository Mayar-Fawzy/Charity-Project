import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ForgetpasswordService } from '../core/Services/forgetpassword.service';
import { InputOtpModule } from 'primeng/inputotp';
@Component({
  selector: 'app-forgetpassword',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule , RouterLink,InputOtpModule],
  templateUrl: './forgetpassword.component.html',
  styleUrls:['../../../core/Shared/Css/ToastDesign.scss','../core/Shared/Shared.scss', './forgetpassword.component.scss']
})
export class ForgetpasswordComponent {
  private readonly _ToastrService=inject(ToastrService);
  private readonly _ForgetpasswordService=inject(ForgetpasswordService);
  private readonly _Router=inject(Router);
  codeInvalidLength: boolean = true;
  step1: boolean = true;
  step2: boolean = false;
  step3: boolean = false;
  message: string = '';
  isloading = false;

  forgetpasswordform: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  ResetCodeform: FormGroup = new FormGroup({
    code: new FormControl('', [Validators.required]),
  });
//newPass 
  newPasswordform: FormGroup = new FormGroup({
   
    password: new FormControl(null, [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/),
    ]),
   
    email: new FormControl('', [Validators.required, Validators.email]),
     
    confirmPassword: new FormControl(null, [Validators.required])
  }, { validators: this.confirmPassword });



  handelforgetpassword(): void {
    this.isloading = true;
    let emailinfo = this.forgetpasswordform.value.email;

    this._ForgetpasswordService.forgetPassword(emailinfo).subscribe({
      next: (response) => {
        console.log(response);
        this.isloading = false;
        this._ToastrService.success('success', 'تفقد بريدك الالكتروني');
        this.step1 = false;
        this.step2 = true;
      },
      error: (err) => {
        console.log(err);
        this.isloading = false;
        this.message = err.error.message;
        this._ToastrService.error('error', err.error.message);
      },
    });
  }

  hanelResetCode() {
    this.isloading = true;
    let code = this.ResetCodeform.value.code;
    let email = this.forgetpasswordform.value.email;

    this._ForgetpasswordService.verifyRestCode(email,code).subscribe({
      next: (response) => {
        console.log(response);
        this.isloading = false;
        this._ToastrService.success('success', 'تم التحقق من الكود');
         this.step2 = false;
         this.step3 = true;
       
      },
      error: (err) => {
        console.log(err);
        this.isloading = false;
        this._ToastrService.error('error', err.error.message);
        this.message = err.error.message;
      },
    });
  }

  handelnewPassword() {
    this.isloading = true;
    let email = this.newPasswordform.value.email;
    let password = this.newPasswordform.value.password;
    let confirmPassword = this.newPasswordform.value.confirmPassword;
    this._ForgetpasswordService.resetPassword(email,password,confirmPassword).subscribe({
      next: (response) => {
        console.log(response);
        this.isloading = false;
          this._ToastrService.success('success', 'تم تغيير كلمة المرور');
          this.step3 = false;
          this._Router.navigate(['/login']);
        // }
      },
      error: (err) => {
        console.log(err);
        this.isloading = false;
        this._ToastrService.error('error', err.error.message);
        this.message = err.error.message;
      },
    });
  }
   confirmPassword(group: AbstractControl) {
        const password = group.get('password')?.value;
        const confirmPassword = group.get('confirmPassword')?.value;
        return password === confirmPassword ? null : { mismatch: true };
      }
      ngOnInit(): void {
        this.ResetCodeform.get('code')?.valueChanges.subscribe(value => {
          this.codeInvalidLength = value?.toString().length !== 6;
        });
      }
      showPasswordLogin = false;
 
  togglePasswordVisibilityLogin() {
    this.showPasswordLogin = !this.showPasswordLogin;
   
  }
  showPassword = false;
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
