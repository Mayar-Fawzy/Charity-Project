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
import { LoginService } from '../../Pages/Auth/core/Services/login.service';
import { Decode } from '../../core/interfaces/decode';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  private readonly _Router = inject(Router);
  private readonly _LoginService = inject(LoginService);

  isNavbarHidden: boolean = false;
  isLogin: boolean = false;
  userData: any;
  userName!: string;
  isMenuOpen: boolean = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (localStorage.getItem('userToken')) {
      this.isLogin = true;
    }

    this.userData = this._LoginService.saveUserAuth();
    this.userName = this.userData['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'];
  }

  navigateToLogin() {
    this._Router.navigate(['/login']);
    console.log('توجه إلى صفحة تسجيل الدخول...');
  }

  handleLogout() {
    this._LoginService.signOut();
    this.isLogin = false; // تأكد من إلغاء حالة تسجيل الدخول
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (isPlatformBrowser(this.platformId) && window.scrollY > 50) {
      this.isNavbarHidden = true;
    } else {
      this.isNavbarHidden = false;
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
}
