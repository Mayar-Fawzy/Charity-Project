import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { TabViewModule } from 'primeng/tabview';
import { RoutingModule } from '../../core/Shared/Models/routing/routing.module';
import { NavbarComponent } from "../navbar/navbar.component";
import { LoginService } from '../../Pages/Auth/core/Services/login.service';

@Component({
  selector: 'app-settings-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    TabViewModule,
    RoutingModule,
    CommonModule,
    NavbarComponent
  ],
  templateUrl: './settings-layout.component.html',
  styleUrls: ['./settings-layout.component.scss']
})
export class SettingsLayoutComponent implements OnInit {
  userId: string = '';
  tabs: any[] = [];
  activeIndex: number = 0;

  constructor(private _LoginService: LoginService) {}

  ngOnInit(): void {
    const userData = this._LoginService.saveUserAuth();
    this.userId = userData?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/primarysid"] || '';

    this.tabs = [
      { value: `profile/${this.userId}`, title: 'الملف الشخصي', icon: 'bi bi-person', route: `/settings/profile/${this.userId}` },
      { value: `account-security/${this.userId}`, title: 'أمان الحساب', icon: 'bi bi-shield-lock', route: `/settings/account-security/${this.userId}` },
      { value: `payment-method/${this.userId}`, title: 'طريقة الدفع', icon: 'bi bi-credit-card', route: `/settings/payment-method/${this.userId}` },
      { value: `notifications/${this.userId}`, title: 'الإشعارات', icon: 'bi bi-bell', route: `/settings/notifications/${this.userId}` },
      { value: `work/${this.userId}`, title: 'الأعمال', icon: 'bi bi-clipboard-check', route: `/settings/work/${this.userId}` },
      { value: 'logout', title: 'الخروج', icon: 'bi bi-box-arrow-right', route: '' }
    ];
  }

  logout() {
    console.log('Logging out...');
  }
}
