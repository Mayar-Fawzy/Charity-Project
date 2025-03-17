import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginService } from './Pages/Auth/core/Services/login.service';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
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
 
