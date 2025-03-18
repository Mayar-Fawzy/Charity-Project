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

export const routes: Routes = [
    // ✅ عند فتح الموقع، يتم توجيه المستخدم إلى صفحة تسجيل الدخول تلقائيًا
    { path: '', redirectTo: 'login', pathMatch: 'full' },

    // ✅ صفحات Login & Register بدون Navbar & Footer
    { path: 'login', title: 'Login', component: LoginComponent },
    { path: 'register', title: 'Register', component: RegisterComponent },
    { path: 'forget-password', title: 'Forget Password', component: ForgetpasswordComponent },

    // ✅ باقي الصفحات داخل Layout يحتوي على Navbar & Footer
    {
        path: '',
        component: RoutesComponent,
        children: [
            { path: 'super-admin', title: 'Super Admin', component: SuperAdminComponent },
            { path: 'admin', title: 'Admin', component: AdminComponent },
            { path: 'donor', title: 'Donor', component: DonorComponent },
            { path: 'beneficiary', title: 'Beneficiary', component: BeneficiaryComponent }, // تعديل اسم المسار من "customor" إلى "customer"
            { path: 'volunteer', title: 'Volunteer', component: VolnteerComponent },
        ]
    },

    // ✅ صفحة Not Found
    { path: '**', title: 'Not Found', component: NotfoundComponent }
];
