import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InkinddonationService } from '../core/Services/inkinddonation.service';

@Component({
  selector: 'app-beneficiary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './beneficiary.component.html',
  styleUrls: ['./beneficiary.component.scss']
})
export class BeneficiaryComponent {

   private readonly _inkind= inject(InkinddonationService);
    
   ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    
   }

  products = [
    {
      title: 'جاكيت شتوي',
      category: 'ملابس',
      condition: 'مستعمل - حالة ممتازة',
      quantity: 1,
      description: 'جاكيت شتوي دافئ، مقاس L، لون كحلي بغطاء رأس.',
      images: ['/Images/inkind-1.png', '/Images/inkind-11.png'],
      currentIndex: 0
    },
    {
      title: 'طعام معلب',
      category: 'طعام',
      condition: 'جديد',
      quantity: 1,
      description: 'المواد الغذائية غير القابلة للتلف بما في ذلك السلع المعلبة والمعكرونة والأرز وغيرها…',
      images: ['/Images/inkind-2.png', '/Images/inkind-8.png'],
      currentIndex: 0
    },
    {
      title: ' دواء',
      category: ' دواء',
      condition: 'جديد',
      quantity: 1,
      description: 'مجموعة اسعافات أولية',
      images: ['/Images/inkind-3.png', '/Images/inkind-13.png'],
      currentIndex: 0
    },
    {
      title: 'كتب',
      category: 'دواء',
      condition: 'مستعمل - حالة جيدة',
      quantity: 1,
      description: 'كتب في مجال الطب قسم الجراحة',
      images: ['/Images/inkind-4.png', '/Images/inkind-14.png'],
      currentIndex: 0
    },
    {
      title: 'ملابس أطفال',
      category: 'ملابس',
      condition: 'مستعمل - حالة ممتازة',
      quantity: 1,
      description: 'ملابس اطفال حديثي الولادة',
      images: ['/Images/inkind-5.png'],
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
