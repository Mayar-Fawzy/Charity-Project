import { Component, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [],
  templateUrl: './about-us.component.html',
  styleUrl: './about-us.component.scss'
})
export class AboutUsComponent implements AfterViewInit {

  ngAfterViewInit() {
    const cards = document.querySelectorAll('.team-card');

    //animation
    cards.forEach((card, i) => {
      setTimeout(() => {
        card.classList.add('fade-in-up');
      }, i * 200);
    });    
  }
}
