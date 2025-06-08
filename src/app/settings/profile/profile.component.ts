import { Component, OnInit, inject } from '@angular/core';
import { FormGroup, FormControl, Validators, ValidatorFn, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileservicesService } from '../Core/Services/profileservices.service';
import { ToastrService } from 'ngx-toastr';
import { finalize, timeout } from 'rxjs/operators';
import { UserStateService } from '../Core/Services/user-state.service';

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
  private readonly _UserStateService = inject(UserStateService);


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
  hasCustomImage: boolean = false;

  emailDomainValidator(): ValidatorFn {
    const allowedDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'example.com'];
    return (control: AbstractControl): ValidationErrors | null => {
      const email = control.value;
      if (!email) return null;
      const domain = email.substring(email.lastIndexOf('@') + 1).toLowerCase();
      if (allowedDomains.includes(domain)) {
        return null;
      } else {
        return { invalidDomain: true };
      }
    };
  }


  profileForm = new FormGroup({
    firstName: new FormControl(null, [Validators.required, Validators.minLength(3)]),
    lastName: new FormControl(null, [Validators.required, Validators.minLength(3)]),
    email: new FormControl(null, [
      Validators.required,
      Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
      this.emailDomainValidator()
    ]),
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

        // ✅ تحديد الصورة وحالة التخصيص
        this.userImageUrl = data.imageUrl
          ? data.imageUrl
          : data.gender === 0
            ? '/Images/undraw_male-avatar_zkzx.svg'
            : '/Images/undraw_female-avatar_7t6k.svg';

        this.hasCustomImage = !!data.imageUrl && this.userImageUrl != null && !this.userImageUrl.includes('undraw');


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

              const newImageUrl = response.data?.imageUrl || null;
              this._UserStateService.updateUserImage(newImageUrl);
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
      this._Toastr.warning('⚠ الرجاء ملء جميع الحقول بشكل صحيح');
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
      this._Toastr.warning('⚠ الرجاء ملء جميع الحقول بشكل صحيح');
    }
  }

  // getRandomColor(fullName: string): string {
  //   const hash = Array.from(fullName).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  //   const randomColor = (hash % 16777215).toString(16);
  //   return #${randomColor.padStart(6, '0')};
  // }

  getFirstLetter(): string {
    if (this.userData && this.userData.firstName && this.userData.lastName) {
      return (this.userData.firstName[0] + this.userData.lastName[0]).toUpperCase();
    }
    return '';
  }

  get userFullName(): string {
    return `${this.userData?.firstName || ''} ${this.userData?.lastName || ''}`;
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
      // gender: this.originalUserData.gender || '',
      gender: this.originalUserData.gender === 0 ? 'ذكر' : 'أنثى',
      dateOfBirth: this.originalUserData.dateOfBirth
        ? this.originalUserData.dateOfBirth.split('T')[0]
        : ''
    });

    // Reset image state
    this.userImageUrl = this.originalUserData.imageUrl;
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
      this._Toastr.warning('لا توجد بيانات مستخدم لحذف الصورة');
      return;
    }

    this.isLoading = true;

    const formData = new FormData();
    formData.append('id', this.userData.id ?? '');
    formData.append('firstName', this.profileForm.get('firstName')?.value ?? '');
    formData.append('lastName', this.profileForm.get('lastName')?.value ?? '');
    formData.append('email', this.profileForm.get('email')?.value ?? '');
    formData.append('phoneNumber', this.profileForm.get('phoneNumber')?.value ?? '');
    formData.append('address', this.profileForm.get('address')?.value ?? '');
    formData.append('gender', this.userData.gender?.toString() ?? '');
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
          this._Toastr.success('✅ تم حذف الصورة بنجاح');

          this.userData.imageUrl = null;
          this.originalUserData.imageUrl = null;
          this.selectedImage = null;

          this.userImageUrl = this.userData.gender === 0
            ? '/Images/undraw_male-avatar_zkzx.svg'
            : '/Images/undraw_female-avatar_7t6k.svg';

          this.hasCustomImage = false;

          this.profileForm.markAsPristine();
          this.profileForm.markAsUntouched();
          this.checkFormChanges();
           window.location.reload();
        } else {
          this._Toastr.warning(response?.message || 'فشل حذف الصورة');
        }
      },
      error: (error: any) => {
        this._Toastr.error('حدث خطأ أثناء حذف الصورة');
        console.error('removeImage: error', error);
      }
    });
  }

  getGenderName(gender: number): string {
    return gender === 0 ? 'ذكر' : 'أنثى';
  }


  // جزء فتح الصورة 
  showImageModal = false;

  openImageModal() {
    this.showImageModal = true;
  }

  closeImageModal() {
    this.showImageModal = false;
  }

}