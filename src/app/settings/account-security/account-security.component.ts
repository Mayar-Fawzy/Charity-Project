import { Component, inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { ResetpassService } from '../Core/Services/resetpass.service';
import { LoginService } from '../../Pages/Auth/core/Services/login.service';
import { ProfileservicesService } from '../Core/Services/profileservices.service';


@Component({
  selector: 'app-account-security',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './account-security.component.html',
  styleUrls: ['./account-security.component.scss']
})
export class PasswordSettingsComponent implements OnInit {
  private readonly _toastr = inject(ToastrService);
  private readonly _router = inject(Router);
  private readonly _ResetpassService = inject(ResetpassService);
  private readonly _LoginService = inject(LoginService);
  private readonly _profileServicesService = inject(ProfileservicesService);
  private readonly _ActivatedRoute= inject(ActivatedRoute);
  private readonly _Toastr= inject(ToastrService);

  userData: any = null;
  showNewPassword = false;
  showConfirmPassword = false;

  isLoading = false;
  passwordStrength = 0;
  passwordStrengthLabel = 'ضعيفة';

  passwordForm!: FormGroup;

  ngOnInit(): void {
    const id = this._ActivatedRoute.snapshot.paramMap.get('id');
    if (!id) {
      this._Toastr.error('لم يتم العثور على معرف المستخدم.');
      return;
    }

    this.passwordForm = new FormGroup({
      email: new FormControl({ value: '', disabled: true }, [Validators.required, Validators.email]),
      newPassword: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      ]),
      confirmPassword: new FormControl('', [Validators.required])
    }, { validators: [this.confirmPasswordValidator] });

    // جلب بيانات المستخدم من الـ API
    this._profileServicesService.GetUserById(id).subscribe({
      next: (data: any) => {
        const emailFromApi =  data.data.email;
        if (emailFromApi) {
          this.passwordForm.get('email')?.setValue(emailFromApi);
          console.log(emailFromApi);
        } else {
          this._toastr.warning('لم يتم العثور على البريد الإلكتروني');
        }
      },
      error: (err) => {
        console.error(err);
        this._toastr.error('حدث خطأ أثناء جلب بيانات المستخدم');
      }
    });
  }

  confirmPasswordValidator(group: AbstractControl): { [key: string]: boolean } | null {
    const password = group.get('newPassword')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password === confirm ? null : { mismatch: true };
  }

  toggleShowNewPassword() {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleShowConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  checkPasswordStrength() {
    const password = this.passwordForm.get('newPassword')?.value || '';
    let score = 0;

    if (password.length >= 8) score += 25;
    if (/[A-Z]/.test(password)) score += 25;
    if (/\d/.test(password)) score += 25;
    if (/[^A-Za-z0-9]/.test(password)) score += 25;

    this.passwordStrength = score;

    if (score < 50) {
      this.passwordStrengthLabel = 'ضعيفة';
    } else if (score < 75) {
      this.passwordStrengthLabel = 'متوسطة';
    } else {
      this.passwordStrengthLabel = 'قوية';
    }
  }

  getStrengthClass(): string {
    if (this.passwordStrength < 50) return 'bg-danger';
    if (this.passwordStrength < 75) return 'bg-warning';
    return 'bg-success';
  }

  updatePassword() {
    this.isLoading = true;
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      this.isLoading = false;
      return;
    }

    const email = this.passwordForm.get('email')?.value;
    const newPassword = this.passwordForm.get('newPassword')?.value;
    const confirmPassword = this.passwordForm.get('confirmPassword')?.value;

    this._ResetpassService.resetPassword(email, newPassword, confirmPassword).subscribe({
      next: () => {
        this._toastr.success('تم تحديث كلمة المرور بنجاح');
        this.onCancel();
      },
      error: (err) => {
        console.error(err?.error?.message);
        this._toastr.error(err?.error?.message || 'فشل تحديث كلمة المرور', 'حدث خطأ');
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  onCancel() {
    const email = this.passwordForm.get('email')?.value;
  
    this.passwordForm.reset({
      email: { value: email, disabled: true },
      newPassword: '',
      confirmPassword: ''
    });
  
    this.passwordStrength = 0;
    this.passwordStrengthLabel = 'ضعيفة';
  }
  
}
