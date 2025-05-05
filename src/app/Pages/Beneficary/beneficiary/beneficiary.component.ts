import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InkinddonationService } from '../core/Services/inkinddonation.service';
import Swal from 'sweetalert2';
import { InkindData } from '../core/Interface/inkind-pages';
import { LoginService } from '../../Auth/core/Services/login.service';
import { VolunteerActivityReqService } from '../core/Services/volunteer-activity-req.service';


@Component({
  selector: 'app-beneficiary',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './beneficiary.component.html',
  styleUrls: ['./beneficiary.component.scss']
})
export class BeneficiaryComponent implements OnInit {
  private readonly _inkind = inject(InkinddonationService);
 private readonly loginService = inject(LoginService);
 private readonly _VolunteerActivityReqService=inject(VolunteerActivityReqService)
  // Map to track the current image index for each product
  private imageIndices = new Map<string, number>();
  products: InkindData[] = [];
  filteredProjects: InkindData[] = [];
  loading = false;
  requestDetails: string = '';

  error: string | null = null;
  userData: any = null;
  searchTerm: string = '';
  itemsPerPage = 6;
  currentPage = 1;
  totalPages = 1;
  totalCount = 0;
  
  selectedProjectId: string = '';

  ngOnInit(): void {
    this.loadPage();
  }
  
  onSearch(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredProjects = this.products.filter(project =>
      project.name.toLowerCase().includes(term)
    );
    console.log('Filtered Projects:', this.filteredProjects);
  }

  loadPage(): void {
    this.loading = true;
    this._inkind.GetPaginatedinKindDonations(this.currentPage, this.itemsPerPage).subscribe({
      next: (res) => {
        this.products = res.data || [];
        this.filteredProjects = [...this.products];
        this.totalCount = res.totalCount;
        this.currentPage = res.currentPage;
        this.totalPages = res.totalPages;
        this.loading = false;
        this.onSearch();
        console.log('Products:', this.products);
        console.log('Pagination Info:', { currentPage: this.currentPage, totalPages: this.totalPages });
      },
      error: (err) => {
        this.error = 'حدث خطأ أثناء جلب البيانات. يرجى المحاولة لاحقًا.';
        this.loading = false;
        Swal.fire({
          icon: 'error',
          title: 'خطأ',
          text: 'حدث خطأ أثناء جلب البيانات',
          confirmButtonColor: '#f6a026',
          confirmButtonText: 'حسنا',
        });
        console.error('Error fetching donations:', err);
      }
    });
  }

 nextImage(productId: string, imageCount: number): void {
    const currentIndex = this.imageIndices.get(productId) || 0;
    const newIndex = (currentIndex + 1) % imageCount;
    this.imageIndices.set(productId, newIndex);
  }

 // Navigate to the previous image for a specific product
 prevImage(productId: string, imageCount: number): void {
  const currentIndex = this.imageIndices.get(productId) || 0;
  const newIndex = (currentIndex - 1 + imageCount) % imageCount;
  this.imageIndices.set(productId, newIndex);
}

// Get the current image index for a product
getCurrentImageIndex(productId: string): number {
  return this.imageIndices.get(productId) || 0;
}


SubmitVolunteerActivity(projectId: string): void {
  this.selectedProjectId = projectId;
  this.createVolunteerApplication();
}
createVolunteerApplication(): void {
    this.userData = this.loginService.saveUserAuth();
  
    if (!this.userData) {
      Swal.fire({
        icon: 'warning',
        title: 'يجب تسجيل الدخول',
        text: 'يرجى تسجيل الدخول أولاً لتقديم طلب التطوع.',
        confirmButtonColor: '#f6a026',
        confirmButtonText: 'حسنا',
      })
      return;
    }
  
    const AssistanceRequestBody = {
      beneficiaryId: this.userData["http://schemas.microsoft.com/ws/2008/06/identity/claims/primarysid"],
      requestDetails: 'يرجى توضيح النشاط', // يمكن استبدالها لاحقًا بمدخل من المستخدم
      inKindDonationId: this.selectedProjectId
    };
  
    this._VolunteerActivityReqService.createVolunteerApplication(AssistanceRequestBody).subscribe(res => {
      if (res.isSucceeded) {
        Swal.fire({
          icon: 'success',
          title: 'تم تقديم طلبك بنجاح!',
          text: 'سيتم مراجعة طلبك قريبًا.',
          confirmButtonColor: '#f6a026',
          confirmButtonText: 'حسنا',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'فشل تقديم الطلب',
          text: res.message || 'حدث خطأ أثناء تقديم الطلب. يرجى المحاولة لاحقًا.',
          confirmButtonColor: '#f6a026',
          confirmButtonText: 'حسنا',
        });
        console.error('Error creating volunteer application:', res.message);
      }
    });

}
  get paginatedProjects() {
    return this.filteredProjects;
  }

  get displayedPages(): number[] {
    const pages: number[] = [];
  const total = this.totalPages;

  // نبدأ من الصفحة الحالية
  let start = this.currentPage;
  // النهاية هتبقى الصفحة الحالية + 1 (يعني 2 أرقام بس)
  let end = Math.min(total, this.currentPage + 1);

  // لو الصفحة الحالية هي آخر صفحة، هنظهر الصفحة اللي قبلها والصفحة الحالية
  if (this.currentPage === total && total > 1) {
    start = this.currentPage - 1;
    end = this.currentPage;
  }
  // لو الصفحة الحالية هي 1 وفيه صفحة واحدة بس، هنظهر الصفحة 1 بس
  else if (this.currentPage === 1 && total === 1) {
    start = 1;
    end = 1;
  }

  // نملّي المصفوفة بالأرقام من start لـ end
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
  }

  // get showLeftDots(): boolean {
  //   return this.displayedPages[0] > 1;
  // }

  // get showRightDots(): boolean {
  //   return this.displayedPages[this.displayedPages.length - 1] < this.totalPages;
  // }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadPage();
    }
  }

  goToPrevious() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadPage();
    }
  }

  goToNext() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadPage();
    }
  }
  SubmitVolunteerActivity2() {
    if (this.loading) return;
  
    this.userData = this.loginService.saveUserAuth();
  
    if (!this.userData) {
      Swal.fire({
        icon: 'warning',
        title: 'يجب تسجيل الدخول',
        text: 'يرجى تسجيل الدخول أولاً لتقديم الطلب.',
        confirmButtonColor: '#f6a026',
        confirmButtonText: 'حسنا',
      });
      return;
    }
  
    if (!this.requestDetails || this.requestDetails.trim() === '') {
      Swal.fire({
        icon: 'error',
        title: 'خطأ',
        text: 'برجاء توضيح طلبك.',
        confirmButtonColor: '#f6a026',
        confirmButtonText: 'حسنا',
      });
      return;
    }
  
    this.loading = true;
  
    const AssistanceRequestBody = {
      beneficiaryId: this.userData["http://schemas.microsoft.com/ws/2008/06/identity/claims/primarysid"],
      requestDetails: this.requestDetails,
      inKindDonationId: null
    };
  
    this._VolunteerActivityReqService.createVolunteerApplication(AssistanceRequestBody).subscribe({
      next: (res) => {
        if (res.isSucceeded) {
          Swal.fire({
            icon: 'success',
            title: 'تم تقديم طلبك بنجاح!',
            text: 'سيتم مراجعة طلبك قريبًا.',
            confirmButtonColor: '#f6a026',
            confirmButtonText: 'حسنا',
          });
          this.requestDetails = ''; // مسح الحقل بعد النجاح
        } else {
          Swal.fire({
            icon: 'error',
            title: 'فشل تقديم الطلب',
            text: res.message || 'حدث خطأ أثناء تقديم الطلب. يرجى المحاولة لاحقًا.',
            confirmButtonColor: '#f6a026',
            confirmButtonText: 'حسنا',
          });
          console.error('Error creating volunteer application:', res.message);
        }
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'خطأ في الاتصال بالخادم',
          text: 'يرجى المحاولة لاحقًا.',
          confirmButtonColor: '#f6a026',
          confirmButtonText: 'حسنا',
        });
        console.error('Request error:', err);
      },
      complete: () => {
        this.loading = false;
      }
    });
  
    console.log(AssistanceRequestBody);
  }
  
}