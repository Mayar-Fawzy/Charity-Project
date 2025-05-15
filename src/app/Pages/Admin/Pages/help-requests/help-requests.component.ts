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

  itemsPerPage = 6;
  currentPage = 1;
  totalPages = 1;
  totalCount = 0;

  ngOnInit() {
    this.loadRequests();
  }

  loadRequests() {
    this.isLoading = true;
    this._AssistanceRequestService.GetPaginatedAssistanceRequests(this.currentPage, this.itemsPerPage).subscribe({
      next: (response) => {
        this.otherHelpRequests = response.data || [];
        this.isLoading = false;
        this.applyFilterAndPagination();
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

  changeTab(tab: 'pending' | 'approved' | 'rejected') {
    this.activeTab = tab;
    this.currentPage = 1;
    this.applyFilterAndPagination();
  }

  applyFilterAndPagination() {
    let statusFilter = 1;

    if (this.activeTab === 'approved') {
      statusFilter = 3;
    } else if (this.activeTab === 'rejected') {
      statusFilter = 2;
    }

    const filtered = this.otherHelpRequests.filter(r => r.requestStatus === statusFilter);

    this.totalCount = filtered.length;
    this.totalPages = Math.ceil(this.totalCount / this.itemsPerPage);

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.filteredProjects = filtered.slice(startIndex, endIndex);
  }


  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyFilterAndPagination();
    }
  }

  goToPrevious() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyFilterAndPagination();
    }
  }

  goToNext() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.applyFilterAndPagination();
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
