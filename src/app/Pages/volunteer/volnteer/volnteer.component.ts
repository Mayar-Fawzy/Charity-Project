import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectService } from './core/Services/project.service';
import { Data } from './../../Donor/core/interface/iproject-donate';
import { CarouselResponsiveOptions } from 'primeng/carousel';
import { CarouselModule } from 'primeng/carousel';
import { RoutingModule } from '../../../core/Shared/Models/routing/routing.module';

@Component({
  selector: 'app-volnteer',
  standalone: true,
  imports: [CommonModule,CarouselModule,RoutingModule],
  templateUrl: './volnteer.component.html',
  styleUrl: './volnteer.component.scss'
})
export class VolnteerComponent {
//project And Assest
private readonly _ProjectService=inject(ProjectService);
    responsiveOptions: CarouselResponsiveOptions[] = [];
     Projects: Data[] = [];
   
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
        this.Projects = res.data;
        console.log("VolnteerProjects", this.Projects);
      });
    }

 

  getProgressPercentage(project: any): number {
    const fakeCurrentAmount = project.targetAmount * 0.4;
    return Math.round((fakeCurrentAmount / project.targetAmount) * 100);
  }

  // project.component.ts

getProjectDurationInDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

 

  // >>>>>>>>>>>> gallery 
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
