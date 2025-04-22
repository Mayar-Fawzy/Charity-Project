import { Data } from './../../Donor/core/interface/iproject-donate';
import { CarouselResponsiveOptions } from 'primeng/carousel';
import {
  Component,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomedonateServiesService } from '../../Donor/core/Services/homedonate-servies.service';

import { CarouselModule } from 'primeng/carousel';
import { TagModule } from 'primeng/tag';
import { RoutingModule } from '../../../core/Shared/Models/routing/routing.module';
import { ProjectFilterPipe } from '../core/pipes/project-filter.pipe';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DonateNowService } from '../core/Services/donate-now.service';
import { LoginService } from '../../Auth/core/Services/login.service';

@Component({
  selector: 'app-donor',
  standalone: true,
  imports: [CommonModule,TagModule,RoutingModule,CarouselModule,ProjectFilterPipe,FormsModule,ReactiveFormsModule],
  templateUrl: './donor.component.html',
  styleUrl: './donor.component.scss'
})
export class DonorComponent {
   private readonly _Router=inject(Router)
   private readonly _LoginService=inject(LoginService)
  searchText: string = '';
  userData: any = null;
    responsiveOptions: CarouselResponsiveOptions[] = [];
    projects:Data[]=[]
    private readonly _HomedonateServiesService=inject(HomedonateServiesService)
    private readonly _DonateNowService=inject(DonateNowService)
    GetDonation(){
      this._HomedonateServiesService.GetDonation().subscribe((res)=>{
        this.projects=res.data;
        console.log(this.projects);
      }
      )
    
    }
    
    getProgressPercentage(project: any): number {
      // نسبة وهمية مؤقتة لعرض شكل الـ UI
      const fakeCurrentAmount = project.targetAmount * 0.4; 
      return Math.round((fakeCurrentAmount / project.targetAmount) * 100);
    }
  
   
  ngOnInit(): void {
    this.responsiveOptions = [
      {
        breakpoint: '1024px',
        numVisible: 3,
        numScroll: 1
      },
      {
        breakpoint: '768px',
        numVisible: 2,
        numScroll: 1
      },
      {
        breakpoint: '560px',
        numVisible: 1,
        numScroll: 1
      }
    ];
    
    this.GetDonation()
    
  }
  // نموذج التبرع النقدي
  goToPayment(projectId: string) {
    this._Router.navigate(['/ewallet-payment', projectId]);
  }
  // نموذج التبرع العيني
  
  donationForm = new FormGroup({
    name: new FormControl('', Validators.required),
    itemType: new FormControl('', Validators.required),
    description: new FormControl(''),
    quantity: new FormControl('', Validators.required),
    images: new FormControl<File[]>([])
  });

 
  onItemTypeChange(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.donationForm.patchValue({ itemType: selectedValue });
  }

  onFileSelected(event: any) {
    const files = Array.from(event.target.files) as File[];
    this.donationForm.patchValue({ images: files });
  }

  triggerFileUpload() {
    const input = document.getElementById('photos');
    if (input) {
      input.click();
    }
  }
  submitDonation() {
    if (this.donationForm.invalid) return;
  
    const formValue = this.donationForm.value;
    const formData = new FormData();
  
    // البيانات الأساسية
    formData.append('name', formValue.name ?? '');
    formData.append('itemType', String(formValue.itemType));

    formData.append('description', formValue.description ?? '');
    formData.append('quantity', formValue.quantity ?? '');
  
    // الصور (إن وجدت)
    formValue.images?.forEach((file: File) => {
      formData.append('images', file);
    });
   this.userData= this._LoginService.saveUserAuth()
    // // معرفات ثابتة (يمكن استبدالها لاحقًا)
     formData.append('donorId', this.userData["http://schemas.microsoft.com/ws/2008/06/identity/claims/primarysid"] ?? '');
     console.log(this.userData.id);
  // formData.append('donorId', '5031cff5-40b5-4602-9542-c7a2e510a7c3');
    // formData.append('projectId', 'PUT_PROJECT_ID_HERE');
  
    this._DonateNowService.CreateInKindDonation(formData).subscribe({
      next: (res) => {
        console.log('تم التبرع بنجاح:', res);
        // بدل alert ممكن تستخدم رسالة على الصفحة أو Toast مثلاً
        alert('تم إرسال التبرع بنجاح!');
        this.donationForm.reset(); // إعادة ضبط النموذج بعد الإرسال
      },
      error: error => {
        console.error('خطأ في إرسال التبرع:', error);
        if (error.error) {
          console.error('تفاصيل الخطأ من السيرفر:', error.error);}
        alert('حدث خطأ أثناء الإرسال.');
      }
    });
  }
  
DonateNow(){
  
}
}
