import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

declare var VANTA: any;

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.scss']
})
export class VerifyEmailComponent implements OnInit, OnDestroy {

  private vantaEffect: any;

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.vantaEffect = VANTA.NET({
      el: '#vanta-bg',
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200.0,
      minWidth: 200.0,
      scale: 1.0,
      scaleMobile: 1.0,
      backgroundColor: 0x000000,
      color: 0xff3f81,
      maxDistance: 18.0,
      spacing: 19.0,
      points: 10,
      showDots: true
    });
  }

  ngOnDestroy(): void {
    if (this.vantaEffect) this.vantaEffect.destroy();
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
