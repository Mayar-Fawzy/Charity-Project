import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  HostListener,
  Inject,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  private readonly _Router=inject(Router);
  isLoggedIn: boolean = false;
  userName: string = '';
  userImage: string = '';
  unreadNotifications: number = 0;
  isNavbarHidden: boolean = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    this.checkUserStatus();
  }

  checkUserStatus() {
    if (isPlatformBrowser(this.platformId)) {
      let userData = {};
      try {
        userData = JSON.parse(localStorage.getItem('user') || '{}');
      } catch (error) {
        console.error('Error parsing user data:', error);
      }

      if (userData && (userData as any).isLoggedIn) {
        this.isLoggedIn = true;
        this.userName = (userData as any).name || 'مستخدم';
        this.userImage = (userData as any).image || 'assets/default-user.png';
        this.unreadNotifications = (userData as any).notifications || 0;
      } else {
        this.isLoggedIn = false;
      }
    }
  }

  login() {
    this._Router.navigate(['/login']);
    console.log('توجه إلى صفحة تسجيل الدخول...');
  
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('user');
      this.isLoggedIn = false;
      this.userName = '';
      this.userImage = '';
      this.unreadNotifications = 0;
      console.log('تم تسجيل الخروج.');
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (isPlatformBrowser(this.platformId) && window.scrollY > 50) {
      this.isNavbarHidden = true;
    } else {
      this.isNavbarHidden = false;
    }
  }
}
