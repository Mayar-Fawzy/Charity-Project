import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface CharityCause {
  title: string;
  description: string;
  imagePath: string;
  amountRaised: number;
  fundingGoal: number;
}

interface Testimonial {
  name: string;
  occupation: string;
  imagePath: string;
  rating: number[];
  feedback: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements AfterViewInit {
  @ViewChild('causesSlider', { static: false }) causesSlider?: ElementRef;

  causes: CharityCause[] = [];
  public testimonialsList: Testimonial[] = [];
  currentIndex = 0;
  cardWidth = 0;
  cardsPerView = 3;

  ngOnInit() {
    this.initializeCauses();
    this.initializeTestimonials();
  }

  private initializeCauses() {
    this.causes = [
      {
        title: 'البطالة',
        description:
          'مساعدة العاطلين عن العمل من خلال توفير فرص تدريبية وفرص عمل.',
        imagePath: 'assets/Images/Unemployment.png',
        amountRaised: 4000,
        fundingGoal: 10000,
      },
      {
        title: 'فقر الغذاء',
        description:
          'تقديم وجبات غذائية للأطفال والعائلات المحتاجة في المناطق الفقيرة.',
        imagePath: 'assets/Images/Food poverty.png',
        amountRaised: 6000,
        fundingGoal: 15000,
      },
      {
        title: 'حقوق الإنسان',
        description: 'الدفاع عن حقوق الإنسان وضمان حياة كريمة للجميع.',
        imagePath: 'assets/Images/Human rights.png',
        amountRaised: 3000,
        fundingGoal: 8000,
      },
      {
        title: 'التعليم للجميع',
        description: 'توفير فرص تعليمية للأطفال المحتاجين في المناطق النائية.',
        imagePath: 'assets/Images/Education for all.png',
        amountRaised: 5000,
        fundingGoal: 12000,
      },
      {
        title: 'مساعدة الأيتام',
        description: 'تقديم الرعاية الكاملة للأيتام من غذاء وتعليم وسكن.',
        imagePath: 'assets/Images/Helping orphans.png',
        amountRaised: 7000,
        fundingGoal: 15000,
      },
    ];
  }

  private initializeTestimonials() {
    this.testimonialsList = [
      {
        name: 'أحمد محمد',
        occupation: 'مصمم UI/UX',
        imagePath: 'assets/Images/person1.png',
        rating: Array(5).fill(1),
        feedback:
          'في مجال الترويج والإعلان، الشهادة أو العرض التوضيحي هو بيان مكتوب يشيد بفضائل منتج معين.',
      },
      {
        name: 'أميرة محمد',
        occupation: 'طبيبة',
        imagePath: 'assets/Images/person2.png',
        rating: Array(5).fill(1),
        feedback:
          'في مجال الترويج والإعلان، الشهادة أو العرض التوضيحي هو بيان مكتوب يشيد بفضائل منتج معين.',
      },
      {
        name: 'تقى محمد',
        occupation: 'مهندسة',
        imagePath: 'assets/Images/person3.png',
        rating: Array(5).fill(1),
        feedback:
          'في مجال الترويج والإعلان، الشهادة أو العرض التوضيحي هو بيان مكتوب يشيد بفضائل منتج معين.',
      },
    ];
  }

  getProgress(cause: CharityCause): number {
    return (cause.amountRaised / cause.fundingGoal) * 100;
  }

  ngAfterViewInit() {
    this.updateScroll();
  }

  scrollLeft() {
    if (this.causesSlider && this.causesSlider.nativeElement) {
      this.causesSlider.nativeElement.scrollBy({
        left: -300, // التحريك للخلف بمقدار 300 بكسل
        behavior: 'smooth', // تمرير سلس
      });
    }
  }

  scrollRight() {
    if (this.causesSlider && this.causesSlider.nativeElement) {
      this.causesSlider.nativeElement.scrollBy({
        left: 300, // التحريك للأمام بمقدار 300 بكسل
        behavior: 'smooth', // تمرير سلس
      });
    }
  }

  updateScroll() {
    if (this.causesSlider && this.causesSlider.nativeElement) {
      const container = this.causesSlider.nativeElement;
      const prevBtn = document.querySelector('.prev-btn') as HTMLElement;
      const nextBtn = document.querySelector('.next-btn') as HTMLElement;

      if (prevBtn && nextBtn) {
        prevBtn.style.display = container.scrollLeft > 0 ? 'flex' : 'none';
        nextBtn.style.display =
          container.scrollLeft + container.clientWidth < container.scrollWidth
            ? 'flex'
            : 'none';
      }
    }
  }
}
