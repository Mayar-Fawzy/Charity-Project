import { CommonModule } from '@angular/common';
import { Component, OnInit, HostListener } from '@angular/core';

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

  ngOnInit(): void {
    this.checkUserStatus();
  }

  checkUserStatus() {
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

  login() {
    console.log('توجه إلى صفحة تسجيل الدخول...');
  }

  logout() {
    localStorage.removeItem('user');
    this.isLoggedIn = false;
    this.userName = '';
    this.userImage = '';
    this.unreadNotifications = 0;
    console.log('تم تسجيل الخروج.');
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (window.scrollY > 50) {
      this.isNavbarHidden = true;
    } else {
      this.isNavbarHidden = false;
    }
  }
}
