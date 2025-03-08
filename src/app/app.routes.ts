import { Routes } from '@angular/router';
import { NotfoundComponent } from './Layout/notfound/notfound.component';
import { AdminComponent } from './Pages/Admin/admin/admin.component';
import { ForgetpasswordComponent } from './Pages/Auth/forgetpassword/forgetpassword.component';
import { LoginComponent } from './Pages/Auth/login/login.component';
import { RegisterComponent } from './Pages/Auth/register/register.component';
import { CustomerComponent } from './Pages/Customer/customer/customer.component';
import { DonorComponent } from './Pages/Donor/donor/donor.component';
import { VolnteerComponent } from './Pages/volunteer/volnteer/volnteer.component';
import { HomeComponent } from './Pages/Home/home/home.component';

import { RoutesComponent } from './core/routes/routes.component';

export const routes: Routes = [
    // ✅ صفحات Login & Register بدون Navbar & Footer
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', title: 'login', component: LoginComponent },
    { path: 'register', title: 'register', component: RegisterComponent },
    { path: 'forgetpassword', title: 'forgetpassword', component: ForgetpasswordComponent },

    // ✅ باقي الصفحات داخل Layout يحتوي على Navbar & Footer
    {
        path: '',
        component: RoutesComponent,
        children: [
            { path: '', redirectTo: 'home', pathMatch: 'full' }, // ✅ توجيه افتراضي لـ Home
            { path: 'admin', title: 'admin', component: AdminComponent },
            { path: 'donor', title: 'donor', component: DonorComponent },
            { path: 'customor', title: 'customor', component: CustomerComponent },
            { path: 'volunteer', title: 'volunteer', component: VolnteerComponent },
            { path: 'home', title: 'home', component: HomeComponent },
        ]
    }
    ,

    // ✅ صفحة Not Found
    { path: '**', title: 'Not Found', component: NotfoundComponent }
];
