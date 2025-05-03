import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarouselModule } from 'primeng/carousel';
import { CarouselResponsiveOptions } from 'primeng/carousel';
import { Router } from '@angular/router';

import { Data } from './../../Donor/core/interface/iproject-donate';
import { RoutingModule } from '../../../core/Shared/Models/routing/routing.module';
import { ProjectService } from '../core/Services/project.service';
import { LoginService } from '../../Auth/core/Services/login.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-volnteer',
  standalone: true,
  imports: [CommonModule, CarouselModule, RoutingModule],
  templateUrl: './volnteer.component.html',
  styleUrl: './volnteer.component.scss'
})
export class VolnteerComponent implements OnInit {
  private readonly projectService = inject(ProjectService);
  private readonly router = inject(Router);
  private readonly loginService = inject(LoginService);

  responsiveOptions: CarouselResponsiveOptions[] = [];
  Projects: Data[] = [];
  selectedProjectId: string = '';
  userData: any = null;

  // مؤقتًا لتوضيح التقدم، لكن يُفضل مستقبلاً جلبه من API
  private readonly dummyProgress = [20, 50, 75, 30, 60, 90];

  ngOnInit(): void {
    this.setupCarouselOptions();
    this.loadProjects();
  }

  private setupCarouselOptions(): void {
    this.responsiveOptions = [
      { breakpoint: '1024px', numVisible: 3, numScroll: 1 },
      { breakpoint: '768px', numVisible: 2, numScroll: 1 },
      { breakpoint: '560px', numVisible: 1, numScroll: 1 }
    ];
  }

  private loadProjects(): void {
    this.projectService.GetDonation().subscribe(res => {
      this.Projects = res.data.map((project: Data, index: number) => ({
        ...project,
        progressPercentage: this.dummyProgress[index % this.dummyProgress.length]
      }));
      console.log("Loaded Volunteer Projects:", this.Projects);
    });
  }

  getProgressPercentage(project: any): number {
    return project.progressPercentage || 0;
  }

  getProjectDurationInDays(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  onJoinProject(projectId: string): void {
    this.selectedProjectId = projectId;
    this.createVolunteerApplication();
  }

  private createVolunteerApplication(): void {
    this.userData = this.loginService.saveUserAuth();
  
    if (!this.userData) {
      Swal.fire({
        icon: 'warning',
        title: 'يجب تسجيل الدخول',
        text: 'يرجى تسجيل الدخول أولاً لتقديم طلب التطوع.',
        confirmButtonColor: '#f6a026',
        confirmButtonText: 'حسنا',
      })
      return;
    }
  
    const volunteerAppBody = {
      volunteerId: this.userData["http://schemas.microsoft.com/ws/2008/06/identity/claims/primarysid"],
      requestDetails: 'يرجى توضيح النشاط', // يمكن استبدالها لاحقًا بمدخل من المستخدم
      volunteerActivityId: null,
      projectId: this.selectedProjectId
    };
  
    this.projectService.CreateVolunteerApplication(volunteerAppBody).subscribe(res => {
      if (res.isSucceeded) {
        Swal.fire({
          icon: 'success',
          title: 'تم تقديم طلب التطوع بنجاح!',
          text: 'شكرًا لمساهمتك في العمل التطوعي!',
          confirmButtonColor: '#f6a026',
          confirmButtonText: 'حسنا',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'فشل تقديم الطلب',
          text: res.message || 'حدث خطأ أثناء تقديم الطلب. يرجى المحاولة لاحقًا.',
          confirmButtonColor: '#f6a026',
          confirmButtonText: 'حسنا',
        });
        console.error('Error creating volunteer application:', res.message);
      }
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
