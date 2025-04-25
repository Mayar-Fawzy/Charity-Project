import { Routes } from '@angular/router';
import { ProfileComponent } from './profile/profile.component';
import { AccountSecurityComponent } from './account-security/account-security.component';
import { PaymentMethodComponent } from './payment-method/payment-method.component';
import { NotificationsComponent } from './notifications/notifications.component';

export const settingsRoutes: Routes = [
    { path: 'profile', component: ProfileComponent },
    { path: 'account-security', component: AccountSecurityComponent },
    { path: 'payment-method', component: PaymentMethodComponent },
    { path: 'notifications', component: NotificationsComponent },
];