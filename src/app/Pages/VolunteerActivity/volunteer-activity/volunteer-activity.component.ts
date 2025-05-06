import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-volunteer-activity',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './volunteer-activity.component.html',
  styleUrls: ['./volunteer-activity.component.scss']
})
export class VolunteerActivityComponent {
  volunteerProjects = [
    {
      title: 'مبادرة تنظيف الشوارع',
      activityDescription:
        'جمع القمامة من الشوارع، تنظيفها وجعلها جميلة وصحية للبيئة والمجتمع بالكامل بمساعدة المتطوعين.',
      createdDate: '2025-05-05',
    },
    {
      title: 'مشروع توعية بيئية',
      activityDescription:
        'تهدف هذه الحملة إلى توعية الناس بالحفاظ على البيئة من خلال توزيع منشورات، حملات تنظيف، وندوات تعليمية موجهة للطلاب، والموظفين، والمجتمع المحلي بشكل عام.',
      createdDate: '2025-04-25',
    },
  ];

  selectedDescription: string | null = null;

  truncate(text: string, limit: number): string {
    return text.length > limit ? text.slice(0, limit) + '...' : text;
  }

  openModal(description: string): void {
    this.selectedDescription = description;

    setTimeout(() => {
      const modalElement = document.getElementById('descriptionModal');
      if (modalElement) {
        const modal = new (window as any).bootstrap.Modal(modalElement);
        modal.show();
      }
    }, 0);
  }
}
