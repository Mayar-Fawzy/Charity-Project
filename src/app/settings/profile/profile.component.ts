import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {

  profileForm = new FormGroup({
    fullName: new FormControl('', Validators.required),  // حقل الاسم كامل
    email: new FormControl('', [Validators.required, Validators.email]), // حقل البريد الإلكتروني
    gender: new FormControl('Male', Validators.required),  // حقل النوع
    dob: new FormControl('', Validators.required),  // حقل تاريخ الميلاد
    phone: new FormControl('', Validators.required),  // حقل الهاتف
    address: new FormControl('', Validators.required),  // حقل العنوان
  });

  // تابع لحفظ البيانات
  onSave() {
    if (this.profileForm.valid) {
      console.log('Form Data: ', this.profileForm.value);  // عرض البيانات في الكونسول
    } else {
      console.log('البيانات غير صالحة');
    }
  }
}
