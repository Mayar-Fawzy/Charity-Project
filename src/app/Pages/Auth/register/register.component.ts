
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormGroup, FormControl, AbstractControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RegisterService } from '../core/Services/register.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: [
    '../../../core/Shared/Css/ToastDesign.scss',
    '../core/Shared/Shared.scss',
    './register.component.scss'
  ]
})
export class RegisterComponent {
  errorr: string = '';
  isloading = false;

  private readonly _router = inject(Router);
  private readonly _ToastService = inject(ToastrService);
  private readonly _RegisterService = inject(RegisterService);

  registerForm: FormGroup = new FormGroup({
    firstName: new FormControl(null, [Validators.required, Validators.minLength(3)]),
    lastName: new FormControl(null, [Validators.required, Validators.minLength(3)]),
    email: new FormControl(null, [Validators.required, Validators.email]),
    address: new FormControl(null, [Validators.required, Validators.minLength(5)]),
    phoneNumber: new FormControl(null, [Validators.required, Validators.pattern(/^\d{11}$/)]),
    dateOfBirth: new FormControl(null, [Validators.required, Validators.pattern(/^\d{4}-\d{2}-\d{2}$/)]),
    gender: new FormControl('اختر النوع', [Validators.required]),
    password: new FormControl(null, [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    ]),
    confirmPassword: new FormControl(null, [Validators.required])
  }, { validators: RegisterComponent.confirmPassword });

  // ✅ Password match validator
  static confirmPassword(group: AbstractControl) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  SubmitRegister(forminfo: FormGroup) {
    if (forminfo.invalid) return;

    this.isloading = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    let formData = { ...forminfo.value };
    formData.gender = Number(formData.gender);

    if (formData.dateOfBirth) {
      const date = new Date(formData.dateOfBirth);
      formData.dateOfBirth = date.toISOString().split('T')[0]; // format as YYYY-MM-DD
    }

    this._RegisterService.Register(formData).subscribe(
      (res) => {
        this.isloading = false;

        if (res.isSucceeded) {
          this._ToastService.success('Please verify your email', '', { timeOut: 3000 });
          this._router.navigate(['/login']);
        } else {
          this._ToastService.error('حدث خطأ أثناء التسجيل', 'خطأ', { timeOut: 3000 });
        }
      },
      (error) => {
        this.isloading = false;
        const errorMessage = error?.error?.errors
          ? Object.values(error.error.errors).join('')
          : 'حدث خطأ غير متوقع';

        this._ToastService.error(errorMessage, 'خطأ', { timeOut: 3000 });
      }
    );
  }

  showPassword = false;
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
   

  showPassword2 = false;     

  togglePasswordVisibility2() {
    this.showPassword2 = !this.showPassword2;
  }  
  
}
