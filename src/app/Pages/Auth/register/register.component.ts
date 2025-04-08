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
    phoneNumber: new FormControl(null, [Validators.required, Validators.pattern(/^\d{11,}$/)]),
    dateOfBirth: new FormControl(null, [
      Validators.required]),
    gender: new FormControl(0, [Validators.required]),

    password: new FormControl(null, [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    ]),

    confirmPassword: new FormControl(null, [Validators.required]), // تم إضافته هنا

    userType: new FormControl(0, [Validators.required])
  }, { validators: this.confirmPassword }); // تم تمرير التحقق هنا

  

     SubmitRegister(forminfo:FormGroup)
     { 
       console.log(forminfo.value);
       let formData = { ...forminfo.value };

       formData.gender = Number(formData.gender);
       formData.userType = Number(formData.userType);
         
if (formData.dateOfBirth) {
  const date = new Date(formData.dateOfBirth);
  formData.dateOfBirth = date.toISOString().split('T')[0]; // يحافظ على YYYY-MM-DD
}
     this. _RegisterService.Register(formData).subscribe((res)=>{
      this.isloading=false;
      console.log('resRegister',res);



     if (res.isSucceeded) {
      this.isloading = true;
      this._ToastService.success('please verify your email', '', { timeOut: 3000 });
      this._router.navigate(['/login'])
    }
    
        },
        (error) => {
          this.isloading = false;
          console.log('error', error);
          this._ToastService.error(error.error.errors, 'error');
        }
      )  
   
     }
     confirmPassword(group: AbstractControl) {
      const password = group.get('password')?.value;
      const confirmPassword = group.get('confirmPassword')?.value;
      return password === confirmPassword ? null : { mismatch: true };
    }
    
    }
