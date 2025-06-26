import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.scss']
})
export class VerifyEmailComponent implements OnInit {
  email: string | null = null;

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.email = sessionStorage.getItem('registeredEmail');
    // sessionStorage.removeItem('registeredEmail');
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
