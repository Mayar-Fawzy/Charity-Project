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
    age: new FormControl({ value: '', disabled: true }),
    gender: new FormControl({ value: '', disabled: true }),
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
          gender: data.gender === 0 ? 'ذكر' : data.gender === 1 ? 'أنثى' : '',
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
}
