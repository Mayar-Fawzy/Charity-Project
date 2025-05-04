import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  OnInit,
  HostListener,
  Inject,
  PLATFORM_ID,
  inject,
  signal,
  ChangeDetectorRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginService } from '../../Pages/Auth/core/Services/login.service';
import { RoutingModule } from '../../core/Shared/Models/routing/routing.module';
import { ProfileservicesService } from '../../settings/Core/Services/profileservices.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RoutingModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  private readonly _Router = inject(Router);
  private readonly _LoginService = inject(LoginService);
  private readonly _ProfileservicesService = inject(ProfileservicesService);
  private readonly _ActivatedRoute = inject(ActivatedRoute);
  private readonly _Toastr = inject(ToastrService);
  private readonly _cdr = inject(ChangeDetectorRef);

  isNavbarHidden: boolean = false;
  isLogin: boolean = false;
  userData: any;
  userName = signal<string>(''); // signal بدلاً من string
  userId!: string;
  userImage: string = 'assets/images/default.png'; // صورة افتراضية
  isMenuOpen: boolean = false;
  isSmallScreen: boolean = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (localStorage.getItem('userToken')) {
      this.isLogin = true;
    }

    this.userData = this._LoginService.saveUserAuth();
    this.userId =
      this.userData?.[
        'http://schemas.microsoft.com/ws/2008/06/identity/claims/primarysid'
      ];

    // if (!this.userId) {
    //   this._Toastr.error('لم يتم العثور على معرف المستخدم.');
    //   return;
    // }

    this._ProfileservicesService.GetUserById(this.userId).subscribe((res) => {
      this.userName.set(res.data.firstName);

      this.userImage =
        res.data.imageUrl && res.data.imageUrl !== ''
          ? res.data.imageUrl
          : 'assets/images/default.png';

      this._cdr.detectChanges(); // يجبر Angular يعيد التحديث
    });

    this.checkScreenSize();
  }

  navigateToLogin() {
    this._Router.navigate(['/login']);
    this.isMenuOpen = false;
  }

  navigateToSignup() {
    this._Router.navigate(['/register']);
    this.isMenuOpen = false;
  }

  logout() {
    this.handleLogout();
  }

  handleLogout() {
    this._LoginService.signOut();
    this.isLogin = false;
    this._Router.navigate(['/login']);
    this.isMenuOpen = false;
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (isPlatformBrowser(this.platformId) && window.scrollY > 50) {
      this.isNavbarHidden = true;
    } else {
      this.isNavbarHidden = false;
    }
  }

  @HostListener('window:resize', [])
  onResize() {
    this.checkScreenSize();
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  checkScreenSize() {
    if (isPlatformBrowser(this.platformId)) {
      this.isSmallScreen = window.innerWidth <= 768;
      if (!this.isSmallScreen) {
        this.isMenuOpen = false;
      }
    }
  }

  closeMenu() {
    if (this.isSmallScreen) {
      this.isMenuOpen = false;
    }
  }
}
