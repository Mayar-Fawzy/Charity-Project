import { Component, OnInit, inject } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileservicesService } from '../Core/Services/profileservices.service';
import { ToastrService } from 'ngx-toastr';

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
  private readonly _Toastr = inject(ToastrService);

  userImageUrl: string | null = null;
  selectedImage: File | null = null;
  userData: any = null;
  originalUserData: any = null;
  isLoading: boolean = false;

  // >>>>>>>>>>>> brithdata
  day: number | null = null;
  month: number | null = null;
  year: number | null = null;

  profileForm = new FormGroup({
    firstName: new FormControl(null, [Validators.required, Validators.minLength(3)]),
    lastName: new FormControl(null, [Validators.required, Validators.minLength(3)]),
    email: new FormControl(null, [Validators.required, Validators.email]),
    phoneNumber: new FormControl(null, [Validators.required, Validators.pattern(/^\d{11}$/)]),
    address: new FormControl(null, [Validators.required, Validators.minLength(5)]),
    gender: new FormControl({ value: '', disabled: true }),
    dateOfBirth: new FormControl({ value: '', disabled: true }, [
      Validators.pattern(/^\d{4}-\d{2}-\d{2}$/)
    ])
  });

  ngOnInit(): void {
    const id = this._ActivatedRoute.snapshot.paramMap.get('id');
    if (!id) {
      this._Toastr.error('لم يتم العثور على معرف المستخدم.');
      return;
    }

    this._ProfileservicesService.GetUserById(id).subscribe({
      next: (data: any) => {
        this.userData = data.data;
        console.log(data.data.dateOfBirth);
        this.originalUserData = { ...data.data };
        this.userImageUrl = data.data.imageUrl;
        this.profileForm.patchValue({
          firstName: data.data.firstName,
          lastName: data.data.lastName,
          email: data.data.email,
          phoneNumber: data.data.phoneNumber,
          address: data.data.address,
          gender: data.data.gender?.toString() || '',
          dateOfBirth: data.data.dateOfBirth ? data.data.dateOfBirth.split('T')[0] : ''
        });

        // >>>>>>>>>>>> هنا فصل اليوم والشهر والسنة
        if (data.data.dateOfBirth) {
          const [year, month, day] = data.data.dateOfBirth.split('T')[0].split('-').map(Number);
          this.year = year;
          this.month = month;
          this.day = day;
        }
      },

      error: (error: any) => {
        console.error('فشل في جلب بيانات المستخدم', error);
        this._Toastr.error(' فشل في جلب بيانات المستخدم');
      }
    });
  }

  getRandomColor(fullName: string): string {
    const hash = Array.from(fullName).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const randomColor = (hash % 16777215).toString(16);
    return `#${randomColor.padStart(6, '0')}`;
  }

  getFirstLetter(): string {
    if (this.userData && this.userData.firstName && this.userData.lastName) {
      return (this.userData.firstName[0] + this.userData.lastName[0]).toUpperCase();
    }
    return '';
  }

  get userFullName(): string {
    return `${this.userData?.firstName} ${this.userData?.lastName}`;
  }

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedImage = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.userImageUrl = reader.result as string;
      };
      reader.readAsDataURL(file);

      this.uploadImage(file);
    }
  }

  removeImage(): void {
    if (!this.userData) return;

    this.isLoading = true;

    const formData = new FormData();
    formData.append('Id', this.userData.id ?? '');
    formData.append('UserName', this.userData.userName ?? '');
    formData.append('firstName', this.userData.firstName ?? '');
    formData.append('lastName', this.userData.lastName ?? '');
    formData.append('email', this.userData.email ?? '');
    formData.append('phoneNumber', this.userData.phoneNumber ?? '');
    formData.append('address', this.userData.address ?? '');
    formData.append('gender', this.userData.gender ?? '');
    formData.append('dateOfBirth', this.userData.dateOfBirth ?? '');
    formData.append('image', '');

    this._ProfileservicesService.UpdateUser(this.userData.id, formData).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.userImageUrl = null;
        this.selectedImage = null;
        this.userData.imageUrl = null;
        this._Toastr.success('تم حذف الصورة بنجاح');
      },
      error: (error: any) => {
        this.isLoading = false;
        this._Toastr.error('حدث خطأ أثناء حذف الصورة');
        console.error('خطأ أثناء حذف الصورة', error);
      }
    });
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      this.isLoading = true;

      const formData = new FormData();
      formData.append('Id', this.userData?.id ?? '');
      formData.append('UserName', this.userData?.userName ?? '');
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
            this.isLoading = false;
            this._Toastr.success(' تم تحديث البيانات بنجاح');
          },
          error: (error: any) => {
            this.isLoading = false;
            this._Toastr.error(' حدث خطأ أثناء التحديث');
            console.error(' خطأ أثناء التحديث', error);
          }
        });
      } else {
        this.isLoading = false;
        this._Toastr.error(' لم يتم العثور على معرف المستخدم.');
      }
    } else {
      this._Toastr.warning('⚠️ الرجاء ملء جميع الحقول بشكل صحيح');
    }
  }

  uploadImage(file: File): void {
    if (!file || !this.userData) return;

    const formData = new FormData();
    formData.append('Id', this.userData.id ?? '');
    formData.append('UserName', this.userData.userName ?? '');
    formData.append('firstName', this.userData.firstName ?? '');
    formData.append('lastName', this.userData.lastName ?? '');
    formData.append('email', this.userData.email ?? '');
    formData.append('phoneNumber', this.userData.phoneNumber ?? '');
    formData.append('address', this.userData.address ?? '');
    formData.append('gender', this.userData.gender ?? '');
    formData.append('dateOfBirth', this.userData.dateOfBirth ?? '');
    formData.append('image', file);

    this._ProfileservicesService.UpdateUser(this.userData.id, formData).subscribe({
      next: (response: any) => {
        this._Toastr.success('تم رفع الصورة بنجاح');
        this.userImageUrl = response.data.data.imageUrl;
      },
      error: (error: any) => {
        this._Toastr.error('حدث خطأ أثناء رفع الصورة');
        console.error('خطأ أثناء رفع الصورة', error);
      }
    });
  }

  onCancel(): void {
    this.profileForm.patchValue(this.originalUserData);
    this._Toastr.info('تم إلغاء التغييرات');
  }
}
