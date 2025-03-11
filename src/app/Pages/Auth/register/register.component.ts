import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink,Router } from '@angular/router';
import { FormGroup, FormControl,AbstractControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
  // constructor(private _AuthService:AuthService  ,private _router:Router){}
  registerForm:FormGroup=new FormGroup({
     
    birthdate:new FormControl(null ,[Validators.required,    Validators.pattern(/^(0[1-9]|[12][0-9]|3[01])\/([1-9]|1[0-2])\/(19|20)\d{2}$/)]),
      email:new FormControl(null ,[Validators.required,Validators.email]),
      password:new FormControl(null ,[Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)]),
      name: new FormControl(null, [Validators.required, Validators.minLength(3)]),
      rePassword:new FormControl(null ,[Validators.required,Validators.minLength(8), Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)]),
      gender:new FormControl(null ,[Validators.required]),
     
     }, this.confirmPassword
    
    )
     SubmitRegister(forminfo:FormGroup)
     {
  
          this._router.navigate(['/login']);
   
     }
     confirmPassword(g :AbstractControl){
      if(g.get('password')?.value=== g.get('rePassword')?.value){
        return null
      }
      else{
        return {mismatch:true}
      }
     }
}
