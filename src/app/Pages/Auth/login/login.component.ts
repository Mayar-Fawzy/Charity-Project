import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router,RouterLink} from '@angular/router';
import {ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule,RouterLink,ReactiveFormsModule,FormsModule],
  templateUrl: './login.component.html',
  styleUrls:['../../../core/Shared/Css/ToastDesign.scss','../core/Shared/Shared.scss','./login.component.scss']
})
export class LoginComponent {

  private readonly _Router = inject(Router);
  private readonly _ToastService = inject(ToastrService);


isloading = false;
passwordFieldType: boolean = true;

siginForm: FormGroup = new FormGroup({
  email: new FormControl(null, [
    Validators.required,
    Validators.email 
  ]),
  password: new FormControl(null, [
    Validators.required,
    Validators.minLength(8),
    Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
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

  // this.isloading=true;
  
  // this.authService.Signin(formInfo.value).subscribe((res) => {
  //   if (res.message === "success") {
  //     this.isloading=false;
      this._ToastService.success("تم التسجيل الدخول بنجاح", "اهلا بيك", {
        timeOut: 
        3000,
      });
  //     localStorage.setItem("userToken", res.token);
  //     localStorage.setItem("userData", JSON.stringify(res.user));

      
  //     this.authService.DecodeUser();
     this._Router.navigate(['/home']);
  //   } 
  // },
  //   (error) => {
  //     this.isloading=false;
  //     this._ToastService.showToast ("error" ,error.error.message);        
     
  // })
 
}



togglePasswordVisibility() {
  this.passwordFieldType = !this.passwordFieldType;
}


}
