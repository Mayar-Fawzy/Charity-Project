import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoginService } from '../../Auth/core/Services/login.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent {
  private readonly _LoginService=inject(LoginService)
  sidebarOpen = true;
<<<<<<< HEAD
  userData:any
  userName!:string
=======
  showItemDonationsSubmenu = false;

>>>>>>> 148fa6d (dashbord-inkinddonation)
  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }
 ngOnInit(): void {
   this.userData = this._LoginService.saveUserAuth();
  
this.userName=this.userData?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname"]+" " + this.userData?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname"]
 }
  
}
