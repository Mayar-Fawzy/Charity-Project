import { Component } from '@angular/core';
import { HomeComponent } from "../../Home/home/home.component";

@Component({
  selector: 'app-donor',
  standalone: true,
  imports: [HomeComponent],
  templateUrl: './donor.component.html',
  styleUrl: './donor.component.scss'
})
export class DonorComponent {

}
