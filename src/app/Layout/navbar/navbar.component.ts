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
  OnDestroy
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginService } from '../../Pages/Auth/core/Services/login.service';
import { RoutingModule } from '../../core/Shared/Models/routing/routing.module';
import { ProfileservicesService } from '../../settings/Core/Services/profileservices.service';
import { ToastrService } from 'ngx-toastr';
import { NotificationService } from '../../settings/notifications/Core/notification.service';
import { SignalrService } from '../../settings/notifications/Core/signalr.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RoutingModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  private readonly _Router = inject(Router);
  private readonly _LoginService = inject(LoginService);
  private readonly _ProfileservicesService = inject(ProfileservicesService);
  private readonly _NotificationsService = inject(NotificationService);
  private readonly _SignalrService = inject(SignalrService);
  private readonly _ActivatedRoute = inject(ActivatedRoute);
  private readonly _Toastr = inject(ToastrService);
  private readonly _cdr = inject(ChangeDetectorRef);

  isNavbarHidden: boolean = false;
  isLogin: boolean = false;
  userData: any;
  userName = signal<string>('');
  userId!: string;
  userImage: string = '/Images/Logo.svg';
  isMenuOpen: boolean = false;
  isSmallScreen: boolean = false;
  notificationCount: number = 0;
  imageLoaded: boolean = false;

  private subscriptions: Subscription[] = [];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  ngOnInit(): void {
    if (sessionStorage.getItem('userToken')) {
      this.isLogin = true;
    }

    this.userData = this._LoginService.saveUserAuth();
    this.userId = this.userData?.[
      'http://schemas.microsoft.com/ws/2008/06/identity/claims/primarysid'
    ];

    if (this.userId) {
      const userSub = this._ProfileservicesService.GetUserById(this.userId).subscribe({
        next: (res) => {
          this.userName.set(res.data.firstName);
          this.userImage = res.data.imageUrl || (res.data.gender==0?'/Images/undraw_male-avatar_zkzx.svg':'/Images/undraw_female-avatar_7t6k.svg')
           

          console.log('User ID:', this.userId);
          this.loadNotificationCount();
          this._cdr.detectChanges();
        },
        error: (err) => {
          console.error('فشل تحميل بيانات المستخدم:', err);
          this.userImage = '/Images/Logo.svg';
        }
      });
      this.subscriptions.push(userSub);

      const countSub = this._NotificationsService.countChanged$.subscribe(change => {
        this.loadNotificationCount();
        this._cdr.detectChanges();
      });
      this.subscriptions.push(countSub);

      this._SignalrService.startConnection(this.userId);

      const notifSub = this._SignalrService.notifications$.subscribe(() => {
        this.loadNotificationCount();
      });
      this.subscriptions.push(notifSub);
    }

    this.checkScreenSize();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this._SignalrService.stopConnection();
  }

  loadNotificationCount() {
    this._NotificationsService.getNotificationCount(this.userId).subscribe({
      next: (count) => {
        console.log('📬 عدد الإشعارات:', count);
        this.notificationCount = count;
        this._cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ فشل تحميل عدد الإشعارات:', err);
        this.notificationCount = 0;
        this._cdr.detectChanges();
      },
    });
  }


  navigateToLogin() {
    this._Router.navigate(['/login']);
    this.isMenuOpen = false;
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

  goToNotifications() {
    this._Router.navigate(['/settings/notifications']);
  }

  onImageLoad() {
    this.imageLoaded = true;
    this._cdr.detectChanges();
  }
}