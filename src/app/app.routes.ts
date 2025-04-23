import { Routes } from '@angular/router';
import { NotfoundComponent } from './Layout/notfound/notfound.component';
import { AdminComponent } from './Pages/Admin/admin/admin.component';
import { ForgetpasswordComponent } from './Pages/Auth/forgetpassword/forgetpassword.component';
import { LoginComponent } from './Pages/Auth/login/login.component';
import { RegisterComponent } from './Pages/Auth/register/register.component';

import { DonorComponent } from './Pages/Donor/donor/donor.component';
import { VolnteerComponent } from './Pages/volunteer/volnteer/volnteer.component';
import { HomeComponent } from './Pages/Home/home/home.component';
import { RoutesComponent } from './core/routes/routes.component';
import { SuperAdminComponent } from './Pages/super-admin/super-admin.component';
import { BeneficiaryComponent } from './Pages/beneficiary/beneficiary/beneficiary.component';
import { EwalletPaymentComponent } from './PaymentMethod/ewallet-payment/ewallet-payment.component';
import { VisaPaymentComponent } from './PaymentMethod/visa-payment/visa-payment.component';

export const routes: Routes = [
    // ✅ عند فتح الموقع، يتم توجيه المستخدم إلى صفحة تسجيل الدخول تلقائيًا
    { path: '', redirectTo: 'home', pathMatch: 'full' },

    // ✅ صفحات Login & Register بدون Navbar & Footer
    { path: 'login', title: 'Login', component: LoginComponent },
    { path: 'register', title: 'Register', component: RegisterComponent },
    { path: 'forget-password', title: 'Forget Password', component: ForgetpasswordComponent },

    // ✅ باقي الصفحات داخل Layout يحتوي على Navbar & Footer
    {
        path: '',
        component: RoutesComponent,
        children: [
            { path: 'home', title: 'Home', component: HomeComponent },
           
            { path: 'donor', title: 'Donor', component: DonorComponent }, 
            { path: 'super-admin', title: 'Super Admin', component: SuperAdminComponent },
            { path: 'admin', title: 'Admin', component: AdminComponent },
            { path: 'beneficiary', title: 'Beneficiary', component: BeneficiaryComponent }, // تعديل اسم المسار من "customor" إلى "customer"
            { path: 'volunteer', title: 'Volunteer', component: VolnteerComponent },
            {
                path: 'ewallet-payment/:id',
                title: 'E-Wallet Payment',
                component: EwalletPaymentComponent
              },
              {
                path: 'visa-payment',
                title: 'Visa Payment',
                component: VisaPaymentComponent
              }
        ]
    },

    // ✅ صفحة Not Found
    { path: '**', title: 'Not Found', component: NotfoundComponent }
];
