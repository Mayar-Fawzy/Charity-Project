import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-help-requests',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './help-requests.component.html',
  styleUrl: './help-requests.component.scss'
})
export class HelpRequestsComponent {

  otherHelpRequests = [
    {
      id: 1,
      // requesterName: 'أحمد سعد',
      date: new Date('2025-05-10'),
      description: 'عايز شوية فلوس',
    },
    {
      id: 2,
      // requesterName: ' أحمد سعد',
      date: new Date('2025-05-12'),
      description: 'عايز شوية فلوس',
    }
  ];

  approve(request: any) {
    console.log('تمت الموافقة على الطلب:', request);
    request.status = 'accepted';
  }

  reject(request: any) {
    console.log('تم رفض الطلب:', request);
    request.status = 'rejected';
  }

  contact(request: any) {
    console.log('التواصل مع مقدم الطلب:', request);
    alert(`سيتم التواصل مع ${request.requesterName}`);
  }
}
