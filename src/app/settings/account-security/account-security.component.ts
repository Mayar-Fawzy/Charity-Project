import { Component, inject } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { ResetpassService } from '../Core/Services/resetpass.service';

@Component({
  selector: 'app-account-security',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './account-security.component.html',
  styleUrls: ['./account-security.component.scss']
})
export class PasswordSettingsComponent {
  private readonly _toastr = inject(ToastrService);
  private readonly _router = inject(Router);
  private readonly _ResetpassService = inject(ResetpassService);

  // عرض/إخفاء كلمات المرور
  showNewPassword = false;
  showConfirmPassword = false;

  // حالة تحميل وأمان
  isLoading = false;
  passwordStrength = 0;
  passwordStrengthLabel = 'ضعيفة';

  // نموذج تغيير كلمة المرور
  passwordForm: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    newPassword: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    ]),
    confirmPassword: new FormControl('', [Validators.required])
  }, { validators: [this.confirmPasswordValidator] });

  // التحقق من تطابق كلمتي المرور
  confirmPasswordValidator(group: AbstractControl): { [key: string]: boolean } | null {
    const password = group.get('newPassword')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password === confirm ? null : { mismatch: true };
  }

  // تبديل عرض كلمة المرور الجديدة
  toggleShowNewPassword() {
    this.showNewPassword = !this.showNewPassword;
  }

  // تبديل عرض تأكيد كلمة المرور
  toggleShowConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // حساب قوة كلمة المرور
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

  // تحديد لون الشريط بناءً على القوة
  getStrengthClass(): string {
    if (this.passwordStrength < 50) return 'bg-danger';
    if (this.passwordStrength < 75) return 'bg-warning';
    return 'bg-success';
  }

  // عند إرسال النموذج
  updatePassword() {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const { email, newPassword, confirmPassword } = this.passwordForm.value;
    this.isLoading = true;

    this._ResetpassService.resetPassword(email, newPassword, confirmPassword).subscribe({
      next: () => {
        this._toastr.success('تم تحديث كلمة المرور بنجاح');
        this.passwordForm.reset();
       
      },
      error: (err) => {
        console.error(err?.error?.message);
        this._toastr.error(err?.error?.message || 'فشل تحديث كلمة المرور','حدث خطأ' );
        this.onCancel();      },
      complete: () => this.isLoading = false
    });
  }

  // إعادة تعيين النموذج
  onCancel() {
    this.passwordForm.reset();
    this.passwordStrength = 0;
    this.passwordStrengthLabel = 'ضعيفة';
  }
}
