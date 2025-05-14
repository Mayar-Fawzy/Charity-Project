import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { LoginService } from '../../../../Auth/core/Services/login.service';
import { InkindData } from '../../../../Beneficary/core/Interface/inkind-pages';
import { InkinddonationService } from '../../../../Beneficary/core/Services/inkinddonation.service';
import { VolunteerActivityReqService } from '../../../../Beneficary/core/Services/volunteer-activity-req.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InkindDonationAdminService } from '../Core/Services/inkind-donation-admin.service';

@Component({
  selector: 'app-pending-items',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './pending-items.component.html',
  styleUrl: './pending-items.component.scss'
})
export class PendingItemsComponent {
   private readonly _inkind = inject(InkindDonationAdminService);
    private readonly loginService = inject(LoginService);
   
    // Map to track the current image index for each product
    private imageIndices = new Map<string, number>();
    products: InkindData[] = [];
    filteredProjects: InkindData[] = [];
    loading = false;
    requestDetails: string = '';
  
    error: string | null = null;
    userData: any = null;
    searchTerm: string = '';
    itemsPerPage = 3;
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
   

  deleteProject(projectId: string) {
     Swal.fire({
       title: 'هل أنت متأكد؟',
       text: 'لن تتمكن من التراجع عن هذا!',
       icon: 'warning',
       showCancelButton: true,
       confirmButtonColor: '#d33',
       cancelButtonColor: '#f6a026',
       confirmButtonText: 'حذف',
       cancelButtonText: 'إلغاء'
     }).then((result) => {
       if (result.isConfirmed) {
         this._inkind.DeleteInKindDonation(projectId).subscribe(
           (response) => {
             if (response.isSucceeded) {
               // Remove the deleted project from the projectss array
               this.products = this.products.filter((project) => project.id !== projectId);
               this.filteredProjects = [...this.products];
               this.totalCount--;
               this.totalPages = Math.ceil(this.totalCount / this.itemsPerPage);
 
               // Adjust the current page if necessary
               if (this.products.length === 0 && this.currentPage > 1) {
                 this.currentPage--;
               }
 
               // Re-fetch the projects to ensure consistency with the server
               this.loadPage();
 
               Swal.fire('تم الحذف!', 'تم حذف المشروع بنجاح.', 'success');
             } else {
               Swal.fire('خطأ!', response.message || 'فشل الحذف', 'error');
             }
           },
           (error) => {
             Swal.fire('خطأ!', 'حدث خطأ أثناء حذف المشروع.', 'error');
             console.error(error);
           }
         );
       }
     });
   }

  approve(item: any) {
    console.log('تم قبول العنصر:', item);
  }

  reject(item: any) {
    console.log('تم رفض العنصر:', item);
  }
}
