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

  userFullName: string = 'أحمد سعد';
  userImageUrl: string | null = null;

  getFirstLetter(name: string): string {
    return name ? name.trim().charAt(0).toUpperCase() : '';
  }

  getRandomColor(name: string): string {
    const colors = ['#FF9B44', '#6C5CE7', '#00B894', '#0984E3', '#D63031', '#FDCB6E'];
    const index = name
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  }
}
