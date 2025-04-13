import {
  Component,
  ElementRef,
  ViewChild,
  Inject,
  PLATFORM_ID,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';

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
  causes: CharityCause[] = [];
  testimonialsList: Testimonial[] = [];
  @ViewChild('causesScroll') causesSlider!: ElementRef;
  currentIndex = 0;
  cardWidth = 300;
  projects:Data[]=[]
  private readonly _HomedonateServiesService=inject(HomedonateServiesService)
  GetDonation(){
    this._HomedonateServiesService.GetDonation().subscribe((res)=>{
      this.projects=res.data;
      console.log(this.projects);
    }
    )
  
  }
  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  ngOnInit() {
    this.initializeCauses();
    this.initializeTestimonials();
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.cardWidth =
        this.causesSlider.nativeElement.querySelector('.cause-card')
          ?.offsetWidth || 300;
      this.updateScrollButtons();
      this.addTouchScroll();
    }
  }

  private initializeCauses() {
    this.causes = [
      {
        title: 'البطالة',
        description:
          'مساعدة العاطلين عن العمل من خلال توفير فرص تدريبية وفرص عمل.',
        imagePath: '/Images/Unemployment.png',
        amountRaised: 4000,
        fundingGoal: 10000,
      },
      {
        title: 'فقر الغذاء',
        description:
          'تقديم وجبات غذائية للأطفال والعائلات المحتاجة في المناطق الفقيرة.',
        imagePath: '/Images/Food poverty.png',
        amountRaised: 6000,
        fundingGoal: 15000,
      },
      {
        title: 'حقوق الإنسان',
        description: 'الدفاع عن حقوق الإنسان وضمان حياة كريمة للجميع.',
        imagePath: '/Images/Human rights.png',
        amountRaised: 3000,
        fundingGoal: 8000,
      },
      {
        title: 'التعليم للجميع',
        description: 'توفير فرص تعليمية للأطفال المحتاجين في المناطق النائية.',
        imagePath: '/Images/Education for all.png',
        amountRaised: 5000,
        fundingGoal: 12000,
      },
      {
        title: 'مساعدة الأيتام',
        description: 'تقديم الرعاية الكاملة للأيتام من غذاء وتعليم وسكن.',
        imagePath: '/Images/Helping orphans.png',
        amountRaised: 7000,
        fundingGoal: 15000,
      },
    ];
  }

  // scroll
scrollLeft() {
  if (!this.causesSlider || !this.causesSlider.nativeElement) return;

  this.causesSlider.nativeElement.scrollBy({
    left: -this.cardWidth,
    behavior: 'smooth',
  });

  setTimeout(() => this.updateScrollButtons(), 300);
}

scrollRight() {
  if (!this.causesSlider || !this.causesSlider.nativeElement) return;

  this.causesSlider.nativeElement.scrollBy({
    left: this.cardWidth,
    behavior: 'smooth',
  });

  setTimeout(() => this.updateScrollButtons(), 300);
}


  updateScrollButtons() {
    if (this.causesSlider?.nativeElement) {
      const container = this.causesSlider.nativeElement;
      const prevBtn = document.querySelector('.prev-btn') as HTMLElement;
      const nextBtn = document.querySelector('.next-btn') as HTMLElement;

      if (prevBtn && nextBtn) {
        prevBtn.classList.toggle('hidden', container.scrollLeft <= 0);
        nextBtn.classList.toggle(
          'hidden',
          container.scrollLeft + container.clientWidth >= container.scrollWidth
        );
      }
    }
  }
  addTouchScroll() {
    if (this.causesSlider?.nativeElement) {
      const slider = this.causesSlider.nativeElement;
      let startX = 0;
      let scrollLeftStart = 0;

      slider.addEventListener('touchstart', (e: TouchEvent) => {
        startX = e.touches[0].pageX;
        scrollLeftStart = slider.scrollLeft;
      });

      slider.addEventListener('touchmove', (e: TouchEvent) => {
        const moveX = e.touches[0].pageX - startX;
        slider.scrollLeft = scrollLeftStart - moveX;
      });

      slider.addEventListener('touchend', () => {
        setTimeout(() => this.updateScrollButtons(), 300); // تحديث الأزرار بعد التمرير
      });
    }
  }

  private initializeTestimonials() {
    this.testimonialsList = [
      {
        name: 'أحمد محمد',
        occupation: 'مصمم UI/UX',
        imagePath: '/Images/person1.png',
        rating: Array(5).fill(1),
        feedback: 'رائع جدًا ومفيد للغاية.',
      },
      {
        name: 'أميرة محمد',
        occupation: 'طبيبة',
        imagePath: '/Images/person2.png',
        rating: Array(5).fill(1),
        feedback: 'تجربة ممتازة وسهلة الاستخدام.',
      },
      {
        name: 'تقى محمد',
        occupation: 'مهندسة',
        imagePath: '/Images/person3.png',
        rating: Array(5).fill(1),
        feedback: 'أحببت التصميم وسهولة التنقل.',
      },
    ];
  }

  getProgress(cause: CharityCause): number {
    return (cause.amountRaised / cause.fundingGoal) * 100;
  }
}
