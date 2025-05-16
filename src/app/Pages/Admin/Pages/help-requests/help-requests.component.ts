import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssistanceRequestService } from './Core/Services/assistance-request.service';
import Swal from 'sweetalert2';
import { Daum } from './Core/Interface/iassistance-request';

@Component({
  selector: 'app-help-requests',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './help-requests.component.html',
  styleUrl: './help-requests.component.scss'
})
export class HelpRequestsComponent {
  private readonly _AssistanceRequestService = inject(AssistanceRequestService);

  otherHelpRequests: Daum[] = [];
  filteredProjects: Daum[] = [];
  isLoading = false;

  activeTab: 'pending' | 'approved' | 'rejected' = 'pending';

  itemsPerPage = 9;
  currentPage = 1;
  totalPages = 1;
  totalCount = 0;

  ngOnInit() {
    this.loadRequests();
  }

  loadRequests() {
    this.isLoading = true;

    let statusFilter: number;
    if (this.activeTab === 'pending') {
      statusFilter = 3;
    } else if (this.activeTab === 'rejected') {
      statusFilter = 2;
    } else {
      statusFilter = 1; // approved
    }

    this._AssistanceRequestService.GetPaginatedAssistanceRequests(this.currentPage, this.itemsPerPage, statusFilter).subscribe({
      next: (response) => {
        this.otherHelpRequests = response.data || [];
        this.totalCount = response.totalCount;
        this.totalPages = response.totalPages;
        this.isLoading = false;
        this.filteredProjects = this.otherHelpRequests; // البيانات جايه جاهزة من السيرفر
      },
      error: (err) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'خطأ',
          text: err.message || 'حدث خطأ أثناء جلب الطلبات',
          confirmButtonColor: '#f6a026',
          confirmButtonText: 'حسنا'
        });
      }
    });
  }

  changeTab(tab: 'approved' | 'pending' | 'rejected') {
    this.activeTab = tab;
    this.currentPage = 1;
    this.loadRequests();
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadRequests();
    }
  }

  goToPrevious() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadRequests();
    }
  }

  goToNext() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadRequests();
    }
  }

  get displayedPages(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    let start = Math.max(1, this.currentPage - 2);
    let end = Math.min(this.totalPages, start + maxPagesToShow - 1);

    if (end - start < maxPagesToShow - 1) {
      start = Math.max(1, end - maxPagesToShow + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  get showLeftDots() {
    return this.displayedPages.length > 0 && this.displayedPages[0] > 1;
  }

  get showRightDots() {
    return this.displayedPages.length > 0 && this.displayedPages[this.displayedPages.length - 1] < this.totalPages;
  }

  deleteRequest(request: Daum) {
    Swal.fire({
      title: 'هل أنت متأكد من حذف هذا الطلب؟',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'نعم، احذفه',
      cancelButtonText: 'إلغاء'
    }).then((result) => {
      if (result.isConfirmed) {
        this._AssistanceRequestService.Delete(request.id).subscribe({
          next: () => {
            Swal.fire('تم الحذف!', 'تم حذف الطلب بنجاح.', 'success');
            this.loadRequests();
          },
          error: (err) => {
            Swal.fire('خطأ', err.message || 'حدث خطأ أثناء حذف الطلب', 'error');
          }
        });
      }
    });
  }


  approve(request: Daum) {
    const updatedRequest = { ...request, requestStatus: 1 };
    this._AssistanceRequestService.UpdateReq(updatedRequest).subscribe(() => {
      Swal.fire('نجاح', 'تم قبول الطلب بنجاح', 'success');
      this.loadRequests();
    });
  }

  reject(request: Daum) {
    const updatedRequest = { ...request, requestStatus: 2 };
    this._AssistanceRequestService.UpdateReq(updatedRequest).subscribe(() => {
      Swal.fire('نجاح', 'تم رفض الطلب بنجاح', 'success');
      this.loadRequests();
    });
  }

  contact(request: Daum) {
    Swal.fire('تواصل', 'سيتم التواصل مع مدير المشروع', 'info');
  }
}
