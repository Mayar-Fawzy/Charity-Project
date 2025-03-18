import { Component } from '@angular/core';
import { HomeComponent } from '../../Home/home/home.component';
HomeComponent

@Component({
  selector: 'app-beneficiary',
  standalone: true,
  imports: [HomeComponent],
  templateUrl: './beneficiary.component.html',
  styleUrl: './beneficiary.component.scss'
})
export class BeneficiaryComponent {

}
