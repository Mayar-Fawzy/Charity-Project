import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginService } from './Pages/Auth/core/Services/login.service';
import { VisaPaymentComponent } from "./PaymentMethod/visa-payment/visa-payment.component";
import { EwalletPaymentComponent } from "./PaymentMethod/ewallet-payment/ewallet-payment.component";
import { FooterComponent } from "./Layout/footer/footer.component";
import { DonorComponent } from "./Pages/Donor/donor/donor.component";
import { VolnteerComponent } from "./Pages/volunteer/volnteer/volnteer.component";
import { NavbarComponent } from "./Layout/navbar/navbar.component";

import { ProfileComponent } from "./settings/profile/profile.component";
import { SettingsLayoutComponent } from "./Layout/settings-layout/settings-layout.component";
import { ScrollToTopComponent } from './shared/scroll-to-top/scroll-to-top.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, VisaPaymentComponent, EwalletPaymentComponent, FooterComponent, DonorComponent, VolnteerComponent, NavbarComponent, ProfileComponent, SettingsLayoutComponent, ScrollToTopComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Charity-Project';
  intervalId:any
    private readonly _LoginService=inject(LoginService);
 ngOnInit(): void {
  
//   this.intervalId = setInterval(() => {
//    this._LoginService.refreshToken().subscribe(
//     (response) => {
//       console.log(response);
//     }
//    )
//    console.log("app");
//   }, 60000); // يتم التحديث كل ثانية
// }
 }
 
}
 
