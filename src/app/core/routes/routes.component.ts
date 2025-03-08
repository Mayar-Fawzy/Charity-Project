import { Component } from '@angular/core';
import { NavbarComponent } from "../../Layout/navbar/navbar.component";
import { FooterComponent } from "../../Layout/footer/footer.component";
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-routes',
  standalone: true,
  imports: [NavbarComponent,RouterOutlet, FooterComponent],
  templateUrl: './routes.component.html',
  styleUrl: './routes.component.scss'
})
export class RoutesComponent {

}
