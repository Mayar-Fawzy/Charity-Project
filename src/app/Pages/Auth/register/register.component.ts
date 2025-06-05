import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild, ElementRef } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import {
  FormGroup,
  FormControl,
  AbstractControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
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
    './register.component.scss',
  ],
})
export class RegisterComponent {
  errorr: string = '';
  isloading = false;

  private readonly _router = inject(Router);
  private readonly _ToastService = inject(ToastrService);
  private readonly _RegisterService = inject(RegisterService);

  // 🗓 خانات تاريخ الميلاد
  birthDay: number | null = null;
  birthMonth: number | null = null;
  birthYear: number | null = null;

  @ViewChild('monthInput') monthInput!: ElementRef;
  @ViewChild('yearInput') yearInput!: ElementRef;

  registerForm: FormGroup = new FormGroup(
    {
      firstName: new FormControl(null, [Validators.required, Validators.minLength(3)]),
      lastName: new FormControl(null, [Validators.required, Validators.minLength(3)]),
      email: new FormControl(null, [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      ]),

      address: new FormControl(null, [Validators.required, Validators.minLength(5)]),
      phoneNumber: new FormControl(null, [Validators.required, Validators.pattern(/^\d{11}$/)]),
      dateOfBirth: new FormControl(null, [
        Validators.required,
        Validators.pattern(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/)
      ]),

      gender: new FormControl(null, [Validators.required]),
      password: new FormControl(null, [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      ]),

      confirmPassword: new FormControl(null, [Validators.required]),
    },
    { validators: RegisterComponent.confirmPassword }
  );

  ngOnInit() {
    this.registerForm.statusChanges.subscribe(() => {
      console.log('Form Status:', this.registerForm.status);
      console.log('Form Errors:', this.registerForm.errors);
      console.log('Form Value:', this.registerForm.value);
    });
  }


  static confirmPassword(group: AbstractControl) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  // ✅ عند اختيار التاريخ من الأيقونة
  onDatePicked(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    if (value) {
      const [year, month, day] = value.split('-').map(Number);
      this.birthYear = year;
      this.birthMonth = month;
      this.birthDay = day;
      this.updateDateOfBirth();
    }
  }

  onDateInputChange(field: 'day' | 'month' | 'year', value: string) {
    const num = Number(value);
    if (field === 'day') {
      this.birthDay = num;
      if (value.length === 2) this.monthInput?.nativeElement.focus();
    } else if (field === 'month') {
      this.birthMonth = num;
      if (value.length === 2) this.yearInput?.nativeElement.focus();
    } else if (field === 'year') {
      this.birthYear = num;
    }
    this.updateDateOfBirth();
  }


  updateDateOfBirth() {
    if (
      this.birthDay != null &&
      this.birthMonth != null &&
      this.birthYear != null &&
      this.isValidDate(this.birthYear, this.birthMonth, this.birthDay)
    ) {
      const formatted =
        this.birthYear.toString().padStart(4, '0') +
        '-' +
        this.birthMonth.toString().padStart(2, '0') +
        '-' +
        this.birthDay.toString().padStart(2, '0');

      this.registerForm.get('dateOfBirth')?.setValue(formatted);
      this.registerForm.get('dateOfBirth')?.markAsDirty();
    } else {
      this.registerForm.get('dateOfBirth')?.setValue(null);
    }
  }

  isValidDate(year: number, month: number, day: number): boolean {
    const date = new Date(year, month - 1, day);
    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  }


  SubmitRegister(forminfo: FormGroup) {
    if (forminfo.invalid) return;

    this.isloading = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    let formData = { ...forminfo.value };
    formData.gender = Number(formData.gender);

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