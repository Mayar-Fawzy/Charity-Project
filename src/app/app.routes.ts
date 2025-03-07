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

export const routes: Routes = [
    {path:'', redirectTo:'login', pathMatch:'full'},
    {path:'login' , title:'login', component:LoginComponent},
    {path:'register' , title:'register', component:RegisterComponent},
    {path:'forgetpassword' , title:'forgetpassword', component:ForgetpasswordComponent},
    {path:'admin',title:'admin',
        component:AdminComponent,
        children:[]
    },
    {path:'donor',title:'donor',
        component:DonorComponent,
        children:[]
    },
    {path:'customor',title:'customor',
        component:CustomerComponent,
        children:[]
    },
    {path:'volunteer',title:'volunteer',
        component:VolnteerComponent,
        children:[]
    },
    {path:'home',title:'home',component:HomeComponent}
    ,
    {
        path: '**',
        title: 'Not Found',
        component:NotfoundComponent
    }
];
