import { PendingItemsComponent } from './Pages/Admin/Pages/item-donations/pending-items/pending-items.component';
import { Routes } from '@angular/router';
import { NotfoundComponent } from './Layout/notfound/notfound.component';
import { AdminComponent } from './Pages/Admin/admin/admin.component';
import { ForgetpasswordComponent } from './Pages/Auth/forgetpassword/forgetpassword.component';
import { LoginComponent } from './Pages/Auth/login/login.component';
import { RegisterComponent } from './Pages/Auth/register/register.component';
import { VerifyEmailComponent } from './Pages/Auth/verify-email/verify-email.component';

import { DonorComponent } from './Pages/Donor/donor/donor.component';
import { VolnteerComponent } from './Pages/volunteer/volnteer/volnteer.component';
import { HomeComponent } from './Pages/Home/home/home.component';
import { RoutesComponent } from './core/routes/routes.component';
import { EwalletPaymentComponent } from './PaymentMethod/ewallet-payment/ewallet-payment.component';
import { VisaPaymentComponent } from './PaymentMethod/visa-payment/visa-payment.component';
import { ProjectsComponent } from './Pages/Projects/projects/projects.component';
import { BeneficiaryComponent } from './Pages/Beneficary/beneficiary/beneficiary.component';
import { VolunteerActivityComponent } from './Pages/VolunteerActivity/volunteer-activity/volunteer-activity.component';
import { AboutUsComponent } from './Pages/About-Us/about-us/about-us.component';


import { SettingsLayoutComponent } from './Layout/settings-layout/settings-layout.component';

import { ProfileComponent } from './settings/profile/profile.component';
import { PasswordSettingsComponent } from './settings/account-security/account-security.component'
import { PaymentMethodComponent } from './settings/payment-method/payment-method.component';
import { NotificationsComponent } from './settings/notifications/notifications.component';
import { WorkComponent } from './settings/work/work.component';
import { AuthGuard } from './core/Guards/auth.guard';
import { GeneralVisaComponent } from './PaymentMethod/general-visa/general-visa.component';
export const routes: Routes = [
  // ✅ عند فتح الموقع، يتم توجيه المستخدم إلى صفحة تسجيل الدخول تلقائيًا
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  // ✅ عند فتح الموقع، يتم توجيه المستخدم إلى صفحة تسجيل الدخول تلقائيًا
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  // ✅ صفحات Login & Register بدون Navbar & Footer
  { path: 'login', title: 'Login', component: LoginComponent },
  { path: 'register', title: 'Register', component: RegisterComponent },
  { path: 'forget-password', title: 'Forget Password', component: ForgetpasswordComponent },
  { path: 'verify-email', title: 'Verify Email', component: VerifyEmailComponent },
  
  // ✅ باقي الصفحات داخل Layout يحتوي على Navbar & Footer
  {
    path: '',
    component: RoutesComponent,
    children: [
      { path: 'home', title: 'Home', component: HomeComponent },

      { path: 'donor', title: 'Donor', component: DonorComponent },

      { path: 'beneficiary', title: 'Beneficiary', component: BeneficiaryComponent }, // تعديل اسم المسار من "customor" إلى "customer"
      { path: 'volunteer', title: 'Volunteer', component: VolnteerComponent },
      { path: 'projects', title: 'Projects', component: ProjectsComponent },
      { path: 'volunteer-activity', title: 'volunteer-activity', component: VolunteerActivityComponent },
      { path: 'about', title: 'About', component: AboutUsComponent },
      { path: 'GenralVisa/:id', title: 'GenralVisa', component: GeneralVisaComponent },
      { path: 'ewallet-payment/:id', title: 'E-Wallet Payment', component: EwalletPaymentComponent, canActivate: [AuthGuard]},
      { path: 'visa-payment/:id', title: 'Visa Payment', component: VisaPaymentComponent},
    ]

  },
  { path: 'admin', component: AdminComponent,canActivate: [AuthGuard], children: [
      {path:'',redirectTo:'overview',pathMatch: 'full'},
      { path: 'overview', loadComponent: () => import('./Pages/Admin/Pages/overview/overview.component').then(m => m.OverviewComponent) },
      { path: 'users', loadComponent: () => import('./Pages/Admin/Pages/users/users.component').then(m => m.UsersComponent) },
      { path: 'projects', loadComponent: () => import('./Pages/Admin/Pages/projects/projects.component').then(m => m.ProjectsComponent) },
      { path: 'volunteers', loadComponent: () => import('./Pages/Admin/Pages/volunteers/volunteers.component').then(m => m.VolunteersComponent) },
      { path: 'volunteer-activities', loadComponent: () => import('./Pages/Admin/Pages/volunteer-activities/volunteer-activities.component').then(m => m.VolunteerActivitiesComponent) },
      { path: 'help-requests', loadComponent: () => import('./Pages/Admin/Pages/help-requests/help-requests.component').then(m => m.HelpRequestsComponent) },
      { path: 'item-donations', loadComponent: () => import('./Pages/Admin/Pages/item-donations/pending-items/pending-items.component').then(m => m.PendingItemsComponent)},
    ]
  },
  {
    path: 'settings', component: SettingsLayoutComponent, children: [
      { path: 'profile/:id', component: ProfileComponent },
      { path: 'account-security/:id', component: PasswordSettingsComponent },
      { path: 'payment-method/:id', component: PaymentMethodComponent },
      { path: 'notifications/:id', component: NotificationsComponent },
      { path: 'work/:id', component: WorkComponent },
      { path: '', redirectTo: 'profile', pathMatch: 'full' }
    ]
  },
  // ✅ صفحة Not Found  
  { path: '**', title: 'Not Found', component: NotfoundComponent },


  // >>>>>>>>>>>>>>>>>>> admin




];