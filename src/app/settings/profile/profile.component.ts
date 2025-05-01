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
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  private readonly _ProfileservicesService = inject(ProfileservicesService);
  private readonly _ActivatedRoute = inject(ActivatedRoute);
  private readonly _Router = inject(Router);

  userImageUrl: string | null = null;
  selectedImage: File | null = null;

  profileForm = new FormGroup({
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    phoneNumber: new FormControl('', [Validators.required]),
    address: new FormControl(''),
    gender: new FormControl('0'), // 0: Male, 1: Female
    dateOfBirth: new FormControl('', [Validators.pattern(/^\d{4}-\d{2}-\d{2}$/)]) // Ensure correct format
  });

  ngOnInit(): void {
    const storedImage = localStorage.getItem('userImage');
    if (storedImage) {
      this.userImageUrl = storedImage;
    }
  }

  get userFullName(): string {
    const first = this.profileForm.get('firstName')?.value || '';
    const last = this.profileForm.get('lastName')?.value || '';
    return `${first} ${last}`.trim();
  }

  getFirstLetter(): string {
    const firstName = this.profileForm.get('firstName')?.value;
    return firstName ? firstName.trim().charAt(0).toUpperCase() : '';
  }

  getRandomColor(name: string): string {
    const colors = ['#FF9B44', '#6C5CE7', '#00B894', '#0984E3', '#D63031', '#FDCB6E'];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedImage = input.files[0];

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        this.userImageUrl = result;
        localStorage.setItem('userImage', result);
      };
      reader.readAsDataURL(this.selectedImage);
    }
  }

  removeImage() {
    this.userImageUrl = null;
    this.selectedImage = null;
    localStorage.removeItem('userImage');
  }

  onSubmit() {
    if (this.profileForm.valid) {
      const formData = new FormData();

      const id = this._ActivatedRoute.snapshot.paramMap.get('id');
      if (!id) {
        alert('لم يتم العثور على معرف المستخدم.');
        return;
      }

      formData.append('id', id);
      formData.append('firstName', this.profileForm.get('firstName')?.value || '');
      formData.append('lastName', this.profileForm.get('lastName')?.value || '');
      formData.append('email', this.profileForm.get('email')?.value || '');
      formData.append('userName', this.profileForm.get('email')?.value || '');
      formData.append('phoneNumber', this.profileForm.get('phoneNumber')?.value || '');
      formData.append('address', this.profileForm.get('address')?.value || '');
      formData.append('gender', this.profileForm.get('gender')?.value || '0');

      const dob = this.profileForm.get('dateOfBirth')?.value;
      if (dob) {
        formData.append('dateOfBirth', new Date(dob).toISOString().split('T')[0]);
      }

      formData.append('createdDate', new Date().toISOString());

      if (this.selectedImage) {
        formData.append('image', this.selectedImage);
      }

      this._ProfileservicesService.UpdateUser(id, formData).subscribe({
        next: (res) => {
          console.log('تم تحديث البيانات بنجاح', res);
          alert('تم تحديث البيانات بنجاح');
        },
        error: (err) => {
          console.error('حدث خطأ أثناء التحديث', err.error.errors);
          alert('حدث خطأ أثناء التحديث');
        }
      });
    }
  }

  onCancel() {
    this.profileForm.reset({
      firstName: 'Ahmed',
      lastName: 'Saad',
      email: 'ahmed@example.com',
      phoneNumber: '+201025363285',
      address: 'المنوفية شبين الكوم',
      gender: '0',
      dateOfBirth: '2002-11-19'
    });
  }
}
