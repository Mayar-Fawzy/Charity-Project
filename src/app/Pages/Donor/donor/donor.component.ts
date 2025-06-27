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
import { InkinddonationService } from '../../Beneficary/core/Services/inkinddonation.service';
import { ProjectStatusArPipe } from "../../Projects/Core/Pipe/project-status-ar.pipe";

@Component({
  selector: 'app-donor',
  standalone: true,
  imports: [CommonModule, TagModule, RoutingModule, CarouselModule, FormsModule, ReactiveFormsModule, ProjectStatusArPipe],
  templateUrl: './donor.component.html',
  styleUrl: './donor.component.scss',
})
export class DonorComponent {
private readonly _Router = inject(Router);
  private readonly _LoginService = inject(LoginService);
  private readonly toastr = inject(ToastrService);
  private readonly _HomedonateServiesService = inject(HomedonateServiesService);
  private readonly _DonateNowService = inject(DonateNowService);

  toastMessage = '';
  showToast = false;
  isSubmitting = false;
  searchText: string = '';
  progressPercentages: number[] = [20, 50, 75, 30, 60, 90];
  userData: any = null;
  responsiveOptions: CarouselResponsiveOptions[] = [];
  projects: Data[] = [];
  searchTerm: string = '';
  filteredProjects: Data[] = [];
  uploadedImages: string[] = [];
  readonly maxImageSizeMB = 10;

  @ViewChild('imageInput') imageInput!: ElementRef<HTMLInputElement>;
  @ViewChild('uploadBox', { read: ElementRef }) uploadBox!: ElementRef;
  @ViewChild('formWrapper', { read: ElementRef }) formWrapper!: ElementRef;

  donationStatuses = [
    { value: 1, label: 'جديد' },
    { value: 2, label: 'مستعمل - حالة ممتازة' },
    { value: 3, label: 'مستعمل - حالة جيدة' }
  ];

  donationForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    itemType: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required, Validators.minLength(3)]),
    donationStatus: new FormControl('', [Validators.required]),
    quantity: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$')]),
    images: new FormControl<File[]>([], [Validators.required])
  });

  ngOnInit(): void {
    this.responsiveOptions = [
      { breakpoint: '1024px', numVisible: 3, numScroll: 1 },
      { breakpoint: '768px', numVisible: 2, numScroll: 1 },
      { breakpoint: '560px', numVisible: 1, numScroll: 1 }
    ];

    this.GetDonation();
  }

  ngAfterViewInit() {
    const uploadBox = this.uploadBox.nativeElement;

    uploadBox.addEventListener('dragover', (e: DragEvent) => {
      e.preventDefault();
      uploadBox.classList.add('dragover');
    });

    uploadBox.addEventListener('dragleave', () => {
      uploadBox.classList.remove('dragover');
    });

    uploadBox.addEventListener('drop', (e: DragEvent) => {
      e.preventDefault();
      uploadBox.classList.remove('dragover');
      const files = e.dataTransfer?.files;
      if (files) {
        this.handleImageSelection({ target: { files } } as any);
      }
    });
  }

  GetDonation() {
    this._HomedonateServiesService.GetDonation().subscribe({
      next: (response: any) => {
        this.projects = response.data.map((project: Data, index: number) => {
          return {
            ...project,
            progressPercentage: this.progressPercentages[index % this.progressPercentages.length],
          };
        });
        this.filteredProjects = [...this.projects];
        this.onSearch();
      },
      error: (err) => {
        Swal.fire({
          icon: "error",
          title: "خطأ",
          text: "حدث خطأ أثناء جلب المشاريع",
          confirmButtonColor: "#f6a026",
          confirmButtonText: "حسنا",
        });
      }
    });
  }

  getProgressPercentage(project: any): number {
    if (project.progressPercentage) {
      return project.progressPercentage;
    }

    if (project.startDate && project.endDate && project.targetAmount) {
      const startDate = new Date(project.startDate);
      const endDate = new Date(project.endDate);
      const currentDate = new Date();
      const totalDuration = endDate.getTime() - startDate.getTime();
      const elapsedDuration = currentDate.getTime() - startDate.getTime();
      const timeProgress = Math.min(Math.max(elapsedDuration / totalDuration, 0), 1);
      const fakeCurrentAmount = project.targetAmount * timeProgress;
      const percentage = Math.round((fakeCurrentAmount / project.targetAmount) * 100);
      return Math.min(percentage, 100);
    }

    const randomPercentage = Math.random() * (0.9 - 0.1) + 0.1;
    return Math.round(randomPercentage * 100);
  }

  onSearch() {
    const term = this.searchTerm.toLowerCase();
    this.filteredProjects = this.projects.filter(project =>
      project.name.toLowerCase().includes(term)
    );
  }

  goToPayment(projectId: string) {
    const token = localStorage.getItem('userToken');
    if (!token) {
      Swal.fire({
        icon: 'warning',
        title: "خطأ",
        text: "يجب عليك التسجيل أولًا قبل التبرع",
        confirmButtonColor: "#f6a026",
        confirmButtonText: "حسنا",
      });
    } else {
      this._Router.navigate(['/ewallet-payment', projectId]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  goToProjects() {
    this._Router.navigate(['/projects']);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  openImageUploader(): void {
    this.imageInput.nativeElement.click();
  }

  handleImageSelection(event: Event): void {
    const input = event.target as HTMLInputElement;
    const validFiles: File[] = [];

    if (input.files) {
      Array.from(input.files).forEach(file => {
        const isValidType = file.type === 'image/png' || file.type === 'image/jpeg';
        const isValidSize = file.size <= this.maxImageSizeMB * 1024 * 1024;

        if (isValidType && isValidSize) {
          validFiles.push(file);
          const reader = new FileReader();
          reader.onload = () => {
            if (reader.result) {
              this.uploadedImages.push(reader.result as string);
            }
          };
          reader.readAsDataURL(file);
        } else {
          this.toastr.error(
            `الملف ${file.name} غير مسموح به أو يتجاوز الحجم المسموح (10 ميجا بايت).`,
            'خطأ في رفع الصورة'
          );
        }
      });

      this.donationForm.patchValue({ images: validFiles });
      this.donationForm.get('images')?.markAsTouched();
    }
  }

  submitDonation() {
    if (this.donationForm.invalid) return;

    this.isSubmitting = true;
    this.userData = this._LoginService.saveUserAuth();

    if (!this.userData) {
      this.isSubmitting = false;
      Swal.fire({
        icon: 'warning',
        title: "يجب تسجيل الدخول",
        text: "يرجى تسجيل الدخول أولًا قبل التبرع.",
        confirmButtonColor: "#f6a026",
        confirmButtonText: "حسنا",
      }).then(() => {
        this.donationForm.reset();
        this.uploadedImages = [];
        this.imageInput.nativeElement.value = '';
      });
      return;
    }

    const donorIdValue = this.userData["http://schemas.microsoft.com/ws/2008/06/identity/claims/primarysid"];
    if (!donorIdValue) {
      this.isSubmitting = false;
      Swal.fire({
        icon: 'warning',
        title: "خطأ في المستخدم",
        text: "لم يتم التعرف على حساب المستخدم، يرجى تسجيل الدخول مجددًا.",
        confirmButtonColor: "#f6a026",
        confirmButtonText: "حسنا",
      }).then(() => {
        this.donationForm.reset();
        this.uploadedImages = [];
        this.imageInput.nativeElement.value = '';
      });
      return;
    }

    const formValue = this.donationForm.value;
    const formData = new FormData();

    formData.append('name', formValue.name ?? '');
    formData.append('itemType', String(formValue.itemType));
    formData.append('donationStatus', formValue.donationStatus ?? '');
    formData.append('description', formValue.description ?? '');
    formData.append('quantity', formValue.quantity ?? '');
    formData.append('donorId', donorIdValue);

    formValue.images?.forEach((file: File) => {
      formData.append('images', file);
    });

    this._DonateNowService.CreateInKindDonation(formData).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        Swal.fire({
          icon: "success",
          title: "تم التبرع بنجاح",
          confirmButtonColor: "#f6a026",
          confirmButtonText: "حسنا",
        }).then(() => {
          this.donationForm.reset();
          this.uploadedImages = [];
          this.imageInput.nativeElement.value = '';
        });
      },
      error: (error) => {
        this.isSubmitting = false;
        Swal.fire({
          icon: "error",
          title: "حدث خطأ",
          text: "حدث خطأ أثناء إرسال الطلب، يرجى المحاولة لاحقًا.",
          confirmButtonColor: "#f6a026",
          confirmButtonText: "حسنا",
        }).then(() => {
          this.donationForm.reset();
          this.uploadedImages = [];
          this.imageInput.nativeElement.value = '';
        });
      }
    });
  }

  isFormEmpty(): boolean {
    const formValue = this.donationForm.value;
    return !formValue.name &&
           !formValue.itemType &&
           !formValue.donationStatus &&
           !formValue.description &&
           !formValue.quantity &&
           (!formValue.images || formValue.images.length === 0);
  }

  onItemTypeChange(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    const typeNameMap: { [key: string]: string } = {
      '1': 'ملابس',
      '2': 'طعام',
      '3': 'مستلزمات طبية',
      '4': ''
    };
    this.donationForm.get('name')?.setValue(typeNameMap[selectedValue] || '');
  }

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

  DonateNow() {}
}