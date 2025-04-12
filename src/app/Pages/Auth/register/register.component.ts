import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink,Router } from '@angular/router';
import { FormGroup, FormControl,AbstractControl, Validators, FormsModule, ReactiveFormsModule, NgModel } from '@angular/forms';
import { RegisterService } from '../core/Services/register.service';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule,RouterLink,ReactiveFormsModule,FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['../../../core/Shared/Css/ToastDesign.scss','../core/Shared/Shared.scss','./register.component.scss']
})
export class RegisterComponent {
  errorr:string='';
  isloading = false;
  errorpassword:string='';
 
   private readonly _router = inject(Router);
   
     private readonly _ToastService = inject(ToastrService);
   private readonly _RegisterService = inject(RegisterService);
   registerForm: FormGroup = new FormGroup({
    firstName: new FormControl(null, [Validators.required, Validators.minLength(3)]),
    lastName: new FormControl(null, [Validators.required, Validators.minLength(3)]),
    email: new FormControl(null, [Validators.required, Validators.email]),
    address: new FormControl(null, [Validators.required, Validators.minLength(5)]),
    phoneNumber: new FormControl(null, [Validators.required, Validators.pattern(/^\d{11}$/)]),
    dateOfBirth: new FormControl(null, [
      Validators.required,  Validators.pattern(/^\d{4}-\d{2}-\d{2}$/)]),
    gender: new FormControl('', [Validators.required]),

    password: new FormControl(null, [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    ]),

    confirmPassword: new FormControl(null, [Validators.required]), // تم إضافته هنا

    userType: new FormControl(0, [Validators.required])
  }, { validators: this.confirmPassword }); // تم تمرير التحقق هنا

  

  SubmitRegister(forminfo: FormGroup) {
    this.isloading = true;
  
    // 👆 Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  
    let formData = { ...forminfo.value };
    formData.gender = Number(formData.gender);
    formData.userType = Number(formData.userType);
  
    // ✅ Format تاريخ الميلاد
    if (formData.dateOfBirth) {
      formData.dateOfBirth = formData.dateOfBirth; // بتيجي كـ string جاهز
    }
    
  
    // ✅ إضافة createUser (مثال: ايميل نفسه أو ثابت مؤقتًا)
    // formData.createUser = formData.email;
  
    this._RegisterService.Register(formData).subscribe(
      (res) => {
        this.isloading = false;
  
        console.log('resRegister', res);
  
        if (res.isSucceeded) {
          this._ToastService.success('Please verify your email', '', { timeOut: 3000 });
          this._router.navigate(['/login']);
        } else {
          // ✅ error بدون crash
          this._ToastService.error('حدث خطأ أثناء التسجيل', 'خطأ', { timeOut: 3000 });
        }
      },
      (error) => {
        this.isloading = false; // ❗️كان عندك true غلط
        console.log('error', error.error.errors);
  
        const errorMessage = error?.error?.errors
          ? Object.values(error.error.errors).join('')
          : 'حدث خطأ غير متوقع';
  
        this._ToastService.error(errorMessage, 'خطأ', { timeOut: 3000 });
        this.isloading = true; // ❗️كان عندك true غلط
      }
    );
  }
  
  
     confirmPassword(group: AbstractControl) {
      const password = group.get('password')?.value;
      const confirmPassword = group.get('confirmPassword')?.value;
      return password === confirmPassword ? null : { mismatch: true };
    }
    
    }
