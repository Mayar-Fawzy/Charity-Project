import { Component, OnInit, inject } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileservicesService } from '../Core/Services/profileservices.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  private readonly _ProfileservicesService = inject(ProfileservicesService);
  private readonly _ActivatedRoute = inject(ActivatedRoute);
  private readonly _Router = inject(Router);

  userImageUrl: string | null = null;
  selectedImage: File | null = null;
  userData: any = null;
  originalUserData: any = null;

  profileForm = new FormGroup({
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    phoneNumber: new FormControl('', [Validators.required]),
    address: new FormControl(''),
    gender: new FormControl({ value: '', disabled: true }), // ⛔ النوع غير قابل للتعديل
    dateOfBirth: new FormControl({ value: '', disabled: true }, [
      Validators.pattern(/^\d{4}-\d{2}-\d{2}$/)
    ]) // ⛔ التاريخ غير قابل للتعديل
  });

  ngOnInit(): void {
    const id = this._ActivatedRoute.snapshot.paramMap.get('id');
    if (!id) {
      alert('لم يتم العثور على معرف المستخدم.');
      return;
    }

    this._ProfileservicesService.GetUserById(id).subscribe({
      next: (data: any) => {
        this.userData = data.data;
        this.originalUserData = { ...data.data };
        this.userImageUrl = data.data.imageUrl ; // تعيين صورة المستخدم من الـ API
        this.profileForm.patchValue({
          firstName: data.data.firstName,
          lastName: data.data.lastName,
          email: data.data.email,
          phoneNumber: data.data.phoneNumber,
          address: data.data.address,

          gender: data.data.gender?.toString() || '',
          dateOfBirth: data.data.dateOfBirth ? data.data.dateOfBirth.split('T')[0] : ''
        });
      },
      error: (error: any) => {
        console.error('فشل في جلب بيانات المستخدم', error);
      }
    });
  }

  // دالة لتوليد لون عشوائي بناءً على الاسم الكامل
  getRandomColor(fullName: string): string {
    const hash = Array.from(fullName).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const randomColor = (hash % 16777215).toString(16); // توليد لون بالصيغة hex
    return `#${randomColor.padStart(6, '0')}`;
  }

  // دالة للحصول على أول حرف من الاسم الكامل
  getFirstLetter(): string {
    if (this.userData && this.userData.firstName && this.userData.lastName) {
      return (this.userData.firstName[0] + this.userData.lastName[0]).toUpperCase();
    }
    return '';
  }

  // خاصية للحصول على الاسم الكامل
  get userFullName(): string {
    return `${this.userData?.firstName} ${this.userData?.lastName}`;
  }

  // دالة للتعامل مع اختيار صورة
  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedImage = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.userImageUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  // دالة لحذف الصورة
  removeImage(): void {
    this.userImageUrl = null;
    this.selectedImage = null;
  }

  // دالة للتعامل مع تحديث البيانات
  onSubmit(): void {
    if (this.profileForm.valid) {
      const formData = new FormData();
  
      formData.append('Id', this.userData?.id ?? ''); // مهم جدًا
      formData.append('UserName', this.userData?.userName ?? ''); // مهم جدًا
      formData.append('firstName', this.profileForm.value.firstName ?? '');
      formData.append('lastName', this.profileForm.value.lastName ?? '');
      formData.append('email', this.profileForm.value.email ?? '');
      formData.append('phoneNumber', this.profileForm.value.phoneNumber ?? '');
      formData.append('address', this.profileForm.value.address ?? '');
  
      if (this.selectedImage) {
        formData.append('image', this.selectedImage, this.selectedImage.name);
      }
  
      const id = this._ActivatedRoute.snapshot.paramMap.get('id');
      if (id) {
        this._ProfileservicesService.UpdateUser(id, formData).subscribe({
          next: (response: any) => {
            console.log('✅ تم التحديث بنجاح', response);
            alert('✅ تم تحديث البيانات بنجاح');
          },
          error: (error: any) => {
            console.error('❌ خطأ أثناء التحديث', error);
            alert('❌ حدث خطأ أثناء التحديث');
          }
        });
      } else {
        alert('❌ لم يتم العثور على معرف المستخدم.');
      }
    } else {
      alert('⚠️ الرجاء ملء جميع الحقول بشكل صحيح');
    }
  }
  
  
  

  // دالة لإلغاء التغييرات
  onCancel(): void {
    this.profileForm.patchValue(this.originalUserData);
    alert('تم إلغاء التغييرات');
  }
}
