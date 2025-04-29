import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss'
})
export class NotificationsComponent {
  notifications = [
    {
      title: 'مهمة جديدة',
      message: 'مهمة توزيع طعام جديدة متاحة في منطقة المعادي',
      timeValue: 1,
      timeUnit: 'د',
      bgClass: 'bg-light-success',
      icon: 'bi bi-clipboard-check',
      iconColor: 'bg-success'
    },
    {
      title: 'تبرع جديد',
      message: 'تم التبرع بمبلغ 500 جنيه لحملة فطور صائم',
      timeValue: 2,
      timeUnit: 'س',
      bgClass: 'bg-light-success',
      icon: 'bi bi-cash-coin',
      iconColor: 'bg-primary'
    },
    {
      title: 'إشعار هام',
      message: 'يرجى تحديث بيانات الاتصال الخاصة بك',
      timeValue: 1,
      timeUnit: 'ي',
      bgClass: 'bg-light-warning',
      icon: 'bi bi-exclamation-triangle',
      iconColor: 'bg-warning'
    },
    {
      title: 'تمت المهمة',
      message: 'لقد أتممت مبادرة تنظيف الشارع',
      timeValue: 2,
      timeUnit: 'س',
      bgClass: 'bg-light',
      icon: 'bi bi-check-circle',
      iconColor: 'bg-secondary'
    }
  ];
  
}

