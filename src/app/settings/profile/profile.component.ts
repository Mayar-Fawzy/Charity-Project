import { IupdateData } from './../Core/Interface/iupdate-data';
import { Component, OnInit, inject } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileservicesService } from '../Core/Services/profileservices.service';
import { ToastrService } from 'ngx-toastr';
import { finalize, timeout } from 'rxjs/operators';

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
  isLoading2: boolean = false;
  id: any;
  day: number | null = null;
  month: number | null = null;
  year: number | null = null;
  profileForm = new FormGroup({
    firstName: new FormControl(null, [Validators.required, Validators.minLength(3)]),
    lastName: new FormControl(null, [Validators.required, Validators.minLength(3)]),
    email: new FormControl(null, [Validators.required, Validators.email]),
    phoneNumber: new FormControl(null, [Validators.required, Validators.pattern(/^[0-9]{11}$/)]),
    address: new FormControl(null, [Validators.required, Validators.minLength(5)]),
    age: new FormControl({ value: '', disabled: true }), // يبقى معطل
    gender: new FormControl({ value: '', disabled: true }), // إزالة disabled ليصبح قابل للتعديل
    dateOfBirth: new FormControl({ value: '', disabled: true }, [
      Validators.pattern(/^\d{4}-\d{2}-\d{2}$/)
    ])
  });

  hasFormChanges: boolean = false;

  ngOnInit(): void {
    this.id = this._ActivatedRoute.snapshot.paramMap.get('id');
    if (!this.id) {
      this._Toastr.error('لم يتم العثور على معرف المستخدم.');
      return;
    }
    this.GetUserData(this.id);
    this.profileForm.valueChanges.subscribe(() => {
      this.checkFormChanges();
    });
  }
  GetUserData(id: string): void {
    this._ProfileservicesService.GetUserById(id).subscribe({
      next: ({ data }: any) => {
        this.userData = data;
        this.originalUserData = { ...data };
        this.userImageUrl = data.imageUrl || null;
  
        this.profileForm.patchValue({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phoneNumber: data.phoneNumber || '',
          address: data.address || '',
          age: data.age || '',
          gender: this.getGenderName(data.gender),
          dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : ''
        });
  
        if (data.dateOfBirth) {
          const [year, month, day] = data.dateOfBirth.split('T')[0].split('-').map(Number);
          this.year = year;
          this.month = month;
          this.day = day;
        }
  
        this.checkFormChanges();
      },
      error: (error: any) => {
        console.error('فشل في جلب بيانات المستخدم', error);
        this._Toastr.error('فشل في جلب بيانات المستخدم');
      }
    });
  }

  checkFormChanges(): void {
    if (!this.originalUserData) {
      this.hasFormChanges = false;
      return;
    }

    const currentValues = this.profileForm.getRawValue();
    this.hasFormChanges = 
      currentValues.firstName !== (this.originalUserData.firstName || '') ||
      currentValues.lastName !== (this.originalUserData.lastName || '') ||
      currentValues.email !== (this.originalUserData.email || '') ||
      currentValues.phoneNumber !== (this.originalUserData.phoneNumber || '') ||
      currentValues.address !== (this.originalUserData.address || '');
  }



  uploadImage(file: File): void {
    if (this.profileForm.valid) {
      this.isLoading2 = true;
      const id = this._ActivatedRoute.snapshot.paramMap.get('id');
      if (id) {
        const formData = new FormData();
        formData.append('id', id);
        formData.append('firstName', this.profileForm.get('firstName')?.value ?? '');
        formData.append('lastName', this.profileForm.get('lastName')?.value ?? '');
        formData.append('email', this.profileForm.get('email')?.value ?? '');
        formData.append('phoneNumber', this.profileForm.get('phoneNumber')?.value ?? '');
        formData.append('address', this.profileForm.get('address')?.value ?? '');
        formData.append('gender', this.userData.gender?.toString() ?? '');
        formData.append('dateOfBirth', this.profileForm.get('dateOfBirth')?.value ?? '');
        formData.append('age', this.profileForm.get('age')?.value ?? '');

        if (this.selectedImage) {
          formData.append('image', this.selectedImage);
        } else if (this.userData.imageUrl) {
          formData.append('imageUrl', this.userData.imageUrl);
        } else {
          formData.append('imageUrl', '');
        }

        this._ProfileservicesService.UpdateUser(id, formData).pipe(
          timeout(30000),
          finalize(() => {
            this.isLoading2 = false;
          })
        ).subscribe({
          next: (response: any) => {
            if (response?.isSucceeded) {
              this._Toastr.success('تم تحديث البيانات بنجاح');
              window.location.reload();
            } else {
              this._Toastr.warning(response?.message || 'تم التحديث لكن بدون بيانات جديدة');
            }
          },
          error: (error: any) => {
            this._Toastr.error('حدث خطأ أثناء التحديث');
          }
        });
      }
    } else {
      this._Toastr.warning('⚠️ الرجاء ملء جميع الحقول بشكل صحيح');
    }
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      this.isLoading = true;
      const id = this._ActivatedRoute.snapshot.paramMap.get('id');
      if (id) {
        const formData = new FormData();
        formData.append('id', id);
        formData.append('firstName', this.profileForm.get('firstName')?.value ?? '');
        formData.append('lastName', this.profileForm.get('lastName')?.value ?? '');
        formData.append('email', this.profileForm.get('email')?.value ?? '');
        formData.append('phoneNumber', this.profileForm.get('phoneNumber')?.value ?? '');
        formData.append('address', this.profileForm.get('address')?.value ?? '');
        formData.append('gender', this.userData.gender?.toString() ?? '');
        formData.append('dateOfBirth', this.profileForm.get('dateOfBirth')?.value ?? '');
        formData.append('age', this.profileForm.get('age')?.value ?? '');

        if (this.selectedImage) {
          formData.append('image', this.selectedImage);
        } else if (this.userData.imageUrl) {
          formData.append('imageUrl', this.userData.imageUrl);
        } else {
          formData.append('imageUrl', '');
        }

        this._ProfileservicesService.UpdateUser(id, formData).pipe(
          timeout(30000),
          finalize(() => {
            this.isLoading = false;
          })
        ).subscribe({
          next: (response: any) => {
            if (response?.isSucceeded) {
              this._Toastr.success('تم تحديث البيانات بنجاح');
              window.location.reload();
            } else {
              this._Toastr.warning(response?.message || 'تم التحديث لكن بدون بيانات جديدة');
            }
          },
          error: (error: any) => {
            this._Toastr.error('حدث خطأ أثناء التحديث');
          }
        });
      }
    } else {
      this._Toastr.warning('⚠️ الرجاء ملء جميع الحقول بشكل صحيح');
    }
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
  onCancel(): void {
    if (!this.originalUserData) {
      this._Toastr.warning('لا توجد بيانات أصلية للإعادة');
      console.warn('onCancel: originalUserData is null');
      return;
    }

    console.log('onCancel: Restoring original data', this.originalUserData);

    // Reset form fields to original values
    this.profileForm.patchValue({
      firstName: this.originalUserData.firstName || '',
      lastName: this.originalUserData.lastName || '',
      email: this.originalUserData.email || '',
      phoneNumber: this.originalUserData.phoneNumber || '',
      address: this.originalUserData.address || '',
      age: this.originalUserData.age || '',
      gender: this.originalUserData.gender || '',
      dateOfBirth: this.originalUserData.dateOfBirth
        ? this.originalUserData.dateOfBirth.split('T')[0]
        : ''
    });

    // Reset image state
    this.userImageUrl = this.originalUserData.imageUrl || null;
    this.selectedImage = null;

    // Reset birth date display
    if (this.originalUserData.dateOfBirth) {
      const [year, month, day] = this.originalUserData.dateOfBirth
        .split('T')[0]
        .split('-')
        .map(Number);
      this.year = year;
      this.month = month;
      this.day = day;
    } else {
      this.year = null;
      this.month = null;
      this.day = null;
    }

    // Reset form change tracking
    this.checkFormChanges();
    this.profileForm.markAsPristine();
    this.profileForm.markAsUntouched();

    this._Toastr.info('تم إعادة البيانات إلى حالتها السابقة');
    console.log('onCancel: Form reset complete, hasFormChanges:', this.hasFormChanges);
  }
  removeImage(): void {
    if (!this.userData) {
      console.warn('removeImage: userData is null');
      this._Toastr.warning('لا توجد بيانات مستخدم للحذف');
      return;
    }
  
    console.log('removeImage: Removing image for user', this.userData.id);
  
    this.isLoading = true;
  
    const formData = new FormData();
    formData.append('id', this.userData.id ?? '');
    formData.append('firstName', this.profileForm.get('firstName')?.value ?? '');
    formData.append('lastName', this.profileForm.get('lastName')?.value ?? '');
    formData.append('email', this.profileForm.get('email')?.value ?? '');
    formData.append('phoneNumber', this.profileForm.get('phoneNumber')?.value ?? '');
    formData.append('address', this.profileForm.get('address')?.value ?? '');
    formData.append('gender', this.userData.gender?.toString() ?? ''); // استخدام القيمة الأصلية (0 أو 1)
    formData.append('dateOfBirth', this.profileForm.get('dateOfBirth')?.value ?? '');
    formData.append('age', this.profileForm.get('age')?.value ?? '');
    formData.append('image', '');
  
    this._ProfileservicesService.UpdateUser(this.userData.id, formData).pipe(
      timeout(30000),
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe({
      next: (response: any) => {
        if (response?.isSucceeded) {
          this.userImageUrl = null;
          this.selectedImage = null;
          this.userData.imageUrl = null;
          this.originalUserData.imageUrl = null;
          this.profileForm.markAsPristine();
          this.profileForm.markAsUntouched();
          this.checkFormChanges();
          this._Toastr.success('تم حذف الصورة بنجاح');
          console.log('removeImage: Image removed, hasFormChanges:', this.hasFormChanges, 'formPristine:', this.profileForm.pristine);
          window.location.reload();
        } else {
          this._Toastr.warning(response?.message || 'فشل حذف الصورة');
        }
      },
      error: (error: any) => {
        this._Toastr.error('حدث خطأ أثناء حذف الصورة');
        console.error('خطأ أثناء حذف الصورة', error);
      }
    });
  }

  getGenderName(gender: number): string {
    return gender === 0 ? 'ذكر' : 'أنثى';
  }
}
