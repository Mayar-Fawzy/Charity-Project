import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-account-security',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './account-security.component.html',
  styleUrl: './account-security.component.scss'
})
export class PasswordSettingsComponent {
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  passwordStrength = 0;
  passwordStrengthLabel = 'ضعيفة';

  passwordForm = new FormGroup({
    currentPassword: new FormControl('', [Validators.required]),
    newPassword: new FormControl('', [Validators.required]),
    confirmPassword: new FormControl('', [Validators.required]),
  });

  toggleShowCurrentPassword() {
    this.showCurrentPassword = !this.showCurrentPassword;
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

  getStrengthClass() {
    if (this.passwordStrength < 50) return 'bg-danger';
    if (this.passwordStrength < 75) return 'bg-warning';
    return 'bg-success';
  }

  updatePassword() {
    if (this.passwordForm.valid) {
      console.log('تم إرسال البيانات:', this.passwordForm.value);
    }
  }

  onCancel() {
    this.passwordForm.reset();
    this.passwordStrength = 0;
    this.passwordStrengthLabel = 'ضعيفة';
  }
}
