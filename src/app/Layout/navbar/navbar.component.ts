import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  HostListener,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit {
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
      const userData = JSON.parse(localStorage.getItem('user') || '{}');

      if (userData && userData.isLoggedIn) {
        this.isLoggedIn = true;
        this.userName = userData.name || 'مستخدم';
        this.userImage = userData.image || 'assets/default-user.png';
        this.unreadNotifications = userData.notifications || 0;
      } else {
        this.isLoggedIn = false;
      }
    }
  }

  login() {
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
    if (typeof window !== 'undefined' && window.scrollY > 50) {
      this.isNavbarHidden = true;
    } else {
      this.isNavbarHidden = false;
    }
  }
}
