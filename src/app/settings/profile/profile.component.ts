import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  userImageUrl: string | null = null;

  profileForm = new FormGroup({
    firstName: new FormControl('Ahmed', [Validators.required]),
    lastName: new FormControl('Saad', [Validators.required]),
    email: new FormControl('ahmed.lab505@example.com', [Validators.required, Validators.email]),
    phone: new FormControl('+201025363285'),
    address: new FormControl('المنوفية - شبين الكوم'),
    gender: new FormControl('Male'),
    dob: new FormControl('2002-11-19')
  });

  get userFullName(): string {
    const first = this.profileForm.get('firstName')?.value || '';
    const last = this.profileForm.get('lastName')?.value || '';
    return `${first} ${last}`.trim();
  }

  getFirstLetter(): string {
    const firstName = this.profileForm.get('firstName')?.value;
    return firstName ? firstName.trim().charAt(0).toUpperCase() : '';
  }

   // دي الوان خلفيات بيختار منها عشوائي
  getRandomColor(name: string): string {
    const colors = ['#FF9B44', '#6C5CE7', '#00B894', '#0984E3', '#D63031', '#FDCB6E'];
    const index = name
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  }

  onSubmit() {
    if (this.profileForm.valid) {
      console.log(this.profileForm.value);
    }
  }

  // دي لو عايز يلغي التعديل اللي عمله
  onCancel() {
    this.profileForm.reset({
      firstName: 'Ahmed',
      lastName: 'Saad',
      email: 'ahmed@example.com',
      phone: '+201025363285',
      address: 'المنوفية شبين الكوم',
      gender: 'Male',
      dob: '2002-11-19'
    });
  }

  // دي حته رفع الصورة بدل الصورة ال (defult)
  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.userImageUrl = e.target?.result as string;
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

   //ده زر انا عملته علشان لو رفع صورة وعايز يحذفها ويرجع ل(defult)
  removeImage() {
    this.userImageUrl = null;
  }
}
