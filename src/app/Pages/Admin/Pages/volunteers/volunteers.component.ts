import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

declare var bootstrap: any;

interface Volunteer {
  type: 'projects' | 'activities';
  status: 1 | 2 | 3; // 1: مقبولة، 2: مرفوضة، 3: قيد المراجعة
  name: string;
  email: string;
  gender: string;
  phone: string;
  projectAddress: string;
  projectDescription: string;
  image: string;
}

@Component({
  selector: 'app-volunteers',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './volunteers.component.html',
  styleUrls: ['./volunteers.component.scss']
})
export class VolunteersComponent {
  selectedType: 'projects' | 'activities' = 'projects';

  // القيم الرقمية للحالة
  tabs = [
    { label: 'قيد المراجعة', value: 3 },
    { label: 'مقبولة', value: 1 },
    { label: 'مرفوضة', value: 2 }
  ];
  selectedTab = 3; // افتراضيًا: قيد المراجعة

  selectedImage: string = '';

  volunteers: Volunteer[] = [
    {
      type: 'projects',
      status: 3,
      name: 'أحمد سعد',
      email: 'ahmed@example.com',
      gender: 'ذكر',
      phone: '01025363285',
      projectAddress: 'التعليم',
      projectDescription: 'مشروع ترميم مدرسة في القاهرة',
      image: 'https://via.placeholder.com/400x200'
    },
    {
      type: 'activities',
      status: 3,
      name: 'ميار فوزي',
      email: 'mayar@example.com',
      gender: 'أنثى',
      phone: '203076491357',
      projectAddress: 'الاطفال',
      projectDescription: 'تنظيم فعالية للأطفال',
      image: 'https://via.placeholder.com/400x200'
    }
  ];

  // فلترة حسب النوع والحالة الرقمية
  get filteredVolunteers(): Volunteer[] {
    return this.volunteers.filter(
      v => v.type === this.selectedType && v.status === this.selectedTab
    );
  }

  // عرض الصورة في مودال
  openImage(image: string) {
    this.selectedImage = image;
    const modal = new bootstrap.Modal(document.getElementById('imageModal')!);
    modal.show();
  }

  // تغيير حالة متطوع
  updateStatus(volunteer: Volunteer, newStatus: 1 | 2 | 3) {
    volunteer.status = newStatus;
  }
}
