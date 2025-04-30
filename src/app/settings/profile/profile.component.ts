<<<<<<< HEAD
import { Component, OnInit } from '@angular/core';
=======
import { Component, inject } from '@angular/core';
>>>>>>> 6c3824ea53d217a9ba5d68be86c2bf857e682afa
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { ProfileservicesService } from '../Core/Services/profileservices.service';


@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
<<<<<<< HEAD
export class ProfileComponent implements OnInit {
=======
export class ProfileComponent {
  private readonly _ProfileservicesService=inject(ProfileservicesService)
     private readonly _ActivatedRoute=inject(ActivatedRoute)
     private readonly _Router=inject(Router)
>>>>>>> 6c3824ea53d217a9ba5d68be86c2bf857e682afa
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

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        this.userImageUrl = result;
        localStorage.setItem('userImage', result);
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  removeImage() {
    this.userImageUrl = null;
    localStorage.removeItem('userImage');
  }
}
