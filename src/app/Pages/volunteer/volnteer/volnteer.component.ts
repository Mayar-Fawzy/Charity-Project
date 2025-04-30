import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-volnteer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './volnteer.component.html',
  styleUrl: './volnteer.component.scss'
})
export class VolnteerComponent {
  projects = [
    {
      title: 'مشروع تعليم لـ 1000 طفل',
      image: '/Images/volt-pro-1.png',
      location: 'أسوان - صعيد مصر',
      duration: '6 أشهر',
      target: 200000,
      raised: 120000,
      volunteers: 20,
      registered: 15,
      progress: 60
    },
    {
      title: 'برنامج الرعاية الصحية',
      image: '/Images/volt-pro-2.png',
      location: 'المجتمعات الريفية',
      duration: '12 شهرًا',
      target: 300000,
      raised: 150000,
      volunteers: 30,
      registered: 20,
      progress: 50
    },
    {
      title: 'مجتمعات مستدامة',
      image: '/Images/volt-pro-3.png',
      location: 'المناطق الحضرية',
      duration: '8 أشهر',
      target: 150000,
      raised: 90000,
      volunteers: 25,
      registered: 18,
      progress: 60
    }
  ];

  navigateToMoreProjects() {
    window.location.href = '';
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
