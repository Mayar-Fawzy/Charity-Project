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

    // Image scal
    const modal = document.getElementById('imageModal') as HTMLElement;
    const modalImg = document.getElementById('modalImage') as HTMLImageElement;
    const closeBtn = document.getElementById('closeModal');

    const images = document.querySelectorAll('.team-card img');
    images.forEach((img) => {
      img.addEventListener('click', () => {
        modal.style.display = 'flex';
        modalImg.src = (img as HTMLImageElement).src;
      });
    });

    closeBtn?.addEventListener('click', () => {
      modal.style.display = 'none';
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });
  }
}
