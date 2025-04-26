// src/app/layout/settings-layout/settings-layout.component.ts
import { Component } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { RouterModule, RouterOutlet }      from '@angular/router';
import { SidebarComponent }  from '../sidebar/sidebar.component';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // 
import { TabViewModule } from 'primeng/tabview';
import { RoutingModule } from '../../core/Shared/Models/routing/routing.module';
@Component({
  selector: 'app-settings-layout',
  standalone: true,
  imports: [ 
    RouterOutlet,
    TabViewModule,
    RoutingModule,
    CommonModule,     
    // RouterModule,    
    // SidebarComponent,
    ],
  templateUrl: './settings-layout.component.html',
  styleUrls: ['./settings-layout.component.scss']
})
export class SettingsLayoutComponent {
  tabs = [
    { value: 'profile', title: 'الملف الشخصي', icon: '', route: '/settings/profile' },
    { value: 'account-security', title: 'أمان الحساب', icon: 'bi bi-shield-lock', route: '/settings/account-security' },
    { value: 'payment-method', title: 'طريقة الدفع', icon: 'bi bi-credit-card', route: '/settings/payment-method' },
    { value: 'notifications', title: 'الإشعارات', icon: 'bi bi-bell', route: '/settings/notifications' },
    { value: 'work', title: 'الأعمال', icon: 'bi bi-clipboard-check', route: '/settings/work' },
    { value: 'logout', title: 'الخروج', icon: 'bi bi-box-arrow-right', route: '' }
  ];

  activeIndex: number = 0;
  logout() {
    // Implement your logout logic here
    console.log('Logging out...');
    // Redirect to login page or perform any other action
  }
}
