import { Data } from './../../Donor/core/interface/iproject-donate';
import { CarouselResponsiveOptions } from 'primeng/carousel';
import {
  Component,
  ElementRef,
  inject,
  Renderer2,
  ViewChild,
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
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-donor',
  standalone: true,
  imports: [CommonModule, TagModule, RoutingModule, CarouselModule, ProjectFilterPipe, FormsModule, ReactiveFormsModule, ],
  templateUrl: './donor.component.html',
  styleUrl: './donor.component.scss',
})
export class DonorComponent {
  
   private readonly _Router=inject(Router)
   private readonly _LoginService=inject(LoginService)
  private readonly toastr = inject(ToastrService)
   private readonly _HomedonateServiesService=inject(HomedonateServiesService)
   private readonly _DonateNowService=inject(DonateNowService);
   toastMessage = '';
showToast = false;
isSubmitting = false;
  searchText: string = '';
  userData: any = null;
    responsiveOptions: CarouselResponsiveOptions[] = [];
    projects:Data[]=[]
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
    const token = localStorage.getItem('userToken');
  
    if (!token) {
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "يجب عليك التسجيل أولًا قبل التبرع",
        confirmButtonColor: "#f6a026",
        confirmButtonText: " حسنا",
      });
     
    } else {
      this._Router.navigate(['/ewallet-payment', projectId]);
    }
  }
  
  // نموذج التبرع العيني
  
  donationForm = new FormGroup({
    name: new FormControl('', [
      Validators.required,
      Validators.minLength(3)
    ]),
    itemType: new FormControl('', Validators.required),
    description: new FormControl('', [
      Validators.required,
      Validators.minLength(3)
    ]),
    DonationStatus: new FormControl('', Validators.required),
    quantity: new FormControl('', [
      Validators.required,
      Validators.pattern('^[0-9]*$') // يقبل فقط أرقام
    ]),
    images: new FormControl<File[]>([])
  });

 
  submitDonation() {
    if (this.donationForm.invalid) return;
    this.isSubmitting = true;
    
    const formValue = this.donationForm.value;
    const formData = new FormData();
    
    formData.append('name', formValue.name ?? '');
    formData.append('itemType', String(formValue.itemType));
    formData.append('donationStatus', formValue.DonationStatus ?? '');
    formData.append('description', formValue.description ?? '');
    formData.append('quantity', formValue.quantity ?? '');
  
    formValue.images?.forEach((file: File) => {
      formData.append('images', file);
    });
  
    this.userData = this._LoginService.saveUserAuth();
    if (!this.userData) {
      this.isSubmitting = false;
     // this.showCenteredToast('error', 'برجاء تسجيل الدخول اولا', 'خطأ');
     Swal.fire({
      icon: "error",
      title: "خطأ",
      text: "يجب عليك التسجيل أولًا قبل التبرع",
      confirmButtonColor: "#f6a026",
      confirmButtonText: " حسنا",
    });
      this.donationForm.reset();
    }
    
    const donorIdValue = this.userData["http://schemas.microsoft.com/ws/2008/06/identity/claims/primarysid"];
    if (!donorIdValue) {
      this.isSubmitting = false;
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "يجب عليك التسجيل أولًا قبل التبرع",
        confirmButtonColor: "#f6a026",
        confirmButtonText: " حسنا",
      });
      return;
    }
  
    formData.append('donorId', donorIdValue);
  
    this._DonateNowService.CreateInKindDonation(formData).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        console.log('تم التبرع بنجاح:', res);
        Swal.fire({
          title: "تم التبرع بنجاح",
          text: "You clicked the button!",
          icon: "success"
        });
        this.showCenteredToast('success', 'تم إرسال التبرع بنجاح!', 'نجاح');
        this.donationForm.reset();
      },
      error: error => {
        this.isSubmitting = false;
        console.error('خطأ في إرسال التبرع:', error);
        this.showCenteredToast('error', 'حدث خطأ أثناء الإرسال.', 'خطأ');
        this.donationForm.reset();
      }
    });
  }
  //change name with select
  showNameInput = false;

   
  onItemTypeChange(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
  
    const typeNameMap: { [key: string]: string } = {
      '1': 'ملابس',
      '2': 'طعام',
      '3': 'مستلزمات طبية',
    };
  
    if (typeNameMap[selectedValue]) {
      // نملأ الاسم تلقائيًا فقط إذا مش "أخرى"
      this.donationForm.get('name')?.setValue(typeNameMap[selectedValue]);
    } else {
      // في حالة "أخرى" ما نغيرش الاسم، المستخدم يكتب بنفسه
      this.donationForm.get('name')?.setValue('');
    }
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
  @ViewChild('formWrapper', { read: ElementRef }) formWrapper!: ElementRef;
  showCenteredToast(type: 'success' | 'error', message: string, title: string) {
    this.toastr[type](message, title);
  
    setTimeout(() => {
      const toastContainer = document.querySelector('.toast-container');
      if (toastContainer && this.formWrapper?.nativeElement) {
        this.formWrapper.nativeElement.appendChild(toastContainer);
        toastContainer.classList.add('toast-inside-form');
      }
    }, 0);
  }
   donationStatuses = [
    { value: 1, label: 'جديد' },
    { value: 2, label: 'مستعمل - حالة ممتازة' },
    { value: 3, label: 'مستعمل - حالة جيدة' }
  ];
  
DonateNow(){
  
}
}
