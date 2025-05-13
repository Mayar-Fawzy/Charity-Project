import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pending-items',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pending-items.component.html',
  styleUrl: './pending-items.component.scss'
})
export class PendingItemsComponent {

  pendingItems = [
    {
      image: 'https://example.com/image.jpg',
      name: 'طعام معلب',
      category: 'طعام',
      status: 'مستعمل - حالة ممتازة',
      quantity: 1,
      description: 'طعام'
    }
  ];


  approve(item: any) {
    console.log('تم قبول العنصر:', item);
  }

  reject(item: any) {
    console.log('تم رفض العنصر:', item);
  }
}
