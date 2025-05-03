import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-beneficiary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './beneficiary.component.html',
  styleUrls: ['./beneficiary.component.scss']
})
export class BeneficiaryComponent {

  products = [
    {
      title: 'جاكيت شتوي',
      category: 'ملابس',
      condition: 'جيد',
      quantity: 1,
      description: 'جاكيت شتوي دافئ، مقاس L، لون كحلي بغطاء رأس.',
      images: ['/Images/inkind-1.png', '/Images/inkind-11.png'],
      currentIndex: 0
    },
    {
      title: 'طعام معلب',
      category: 'طعام',
      condition: 'ممتاز',
      quantity: 1,
      description: 'المواد الغذائية غير القابلة للتلف بما في ذلك السلع المعلبة والمعكرونة والأرز وغيرها…',
      images: ['/Images/inkind-2.png', '/Images/inkind-8.png'],
      currentIndex: 0
    },
  ];

  nextImage(product: any) {
    product.currentIndex = (product.currentIndex + 1) % product.images.length;
  }

  prevImage(product: any) {
    product.currentIndex = (product.currentIndex - 1 + product.images.length) % product.images.length;
  }

  animateRequest(event: Event) {
    const btn = event.target as HTMLElement | null;
    if (btn) {
      btn.classList.add('animate');
      setTimeout(() => btn.classList.remove('animate'), 500);
    }
  }
}
