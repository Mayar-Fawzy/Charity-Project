import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Data } from './../../Donor/core/interface/iproject-donate';
import { CarouselResponsiveOptions } from 'primeng/carousel';
import { CarouselModule } from 'primeng/carousel';
import { RoutingModule } from '../../../core/Shared/Models/routing/routing.module';
import { Router } from '@angular/router';
import { ProjectService } from '../core/Services/project.service';

@Component({
  selector: 'app-volnteer',
  standalone: true,
  imports: [CommonModule, CarouselModule, RoutingModule],
  templateUrl: './volnteer.component.html',
  styleUrl: './volnteer.component.scss'
})
export class VolnteerComponent {
  private readonly _ProjectService = inject(ProjectService);
  private readonly _Router = inject(Router);
  responsiveOptions: CarouselResponsiveOptions[] = [];
  Projects: Data[] = [];
  progressPercentages: number[] = [20, 50, 75, 30, 60, 90]; // نسب تقدم ثابتة

  ngOnInit(): void {
    this.responsiveOptions = [
      { breakpoint: '1024px', numVisible: 3, numScroll: 1 },
      { breakpoint: '768px', numVisible: 2, numScroll: 1 },
      { breakpoint: '560px', numVisible: 1, numScroll: 1 }
    ];
    this.GetDonation();
  }

  GetDonation() {
    this._ProjectService.GetDonation().subscribe((res) => {
      // تعيين progressPercentage لكل مشروع بناءً على المصفوفة
      this.Projects = res.data.map((project: Data, index: number) => {
        return {
          ...project,
          progressPercentage: this.progressPercentages[index % this.progressPercentages.length], // تعيين نسبة تقدم ثابتة
        };
      });
      console.log("VolnteerProjects", this.Projects);
    });
  }

  getProgressPercentage(project: any): number {
    // استرجاع القيمة المخزنة في progressPercentage مباشرة
    return project.progressPercentage || 0;
  }

  getProjectDurationInDays(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  joinAsVolunteer(projectId: string) {
    // افتراض أن الزر سيؤدي إلى صفحة تسجيل المتطوعين
    this._Router.navigate(['/volunteer-registration', projectId]);
    // التمرير إلى أعلى الصفحة بسلاسة
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  galleryItems = [
    {
      image: '/Images/4.png',
      title: 'زراعة أشجار',
      description: '"نزرع اليوم... لنحصد بيئة خضراء غدًا"'
    },
    {
      image: '/Images/3.png',
      title: 'تزيين الشوارع',
      description: '"نحو بيئة أجمل تبدأ من شوارعنا"'
    },
    {
      image: '/Images/6.jpg',
      title: 'نبض الإنسانية',
      description: '"نصل بالرعاية الطبية إلى من هم في أمسّ الحاجة إليها"'
    },
    {
      image: '/Images/vol-gall-3.avif',
      title: 'وجبة أمـــــــل',
      description: '"لأن الجوع لا ينتظر، نمد يد العون"'
    },
    {
      image: '/Images/7.jpg',
      title: 'التعليم حق للجميع',
      description: '"نُسهم في بناء مستقبل مشرق من خلال دعم فرص التعليم للأطفال والشباب"'
    },
    {
      image: '/Images/8.jpg',
      title: 'الاستجابة للكوارث',
      description: '"نقف بجانب المجتمعات المتضررة لتوفير الإغاثة والمساعدة في أصعب الأوقات."'
    }
  ];
}