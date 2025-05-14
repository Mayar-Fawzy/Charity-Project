import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssistanceRequestService } from './Core/Services/assistance-request.service';
import { LoginService } from '../../../Auth/core/Services/login.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { IAssistanceRequest, Daum } from './Core/Interface/iassistance-request';

@Component({
  selector: 'app-help-requests',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './help-requests.component.html',
  styleUrl: './help-requests.component.scss'
})
export class HelpRequestsComponent {
  private readonly _AssistanceRequestService = inject(AssistanceRequestService);
  private readonly _LoginService = inject(LoginService);
  private readonly _Router = inject(Router);

  userData: any = null;
  isLoading: boolean = false;
  filteredProjects: Daum[] = [];
  itemsPerPage = 3;
  currentPage = 1;
  totalPages = 1;
  totalCount = 0;
  selectedProject: Daum[] = [];
  otherHelpRequests: Daum[] = [];

  ngOnInit(): void {
    this.getPaginatedReqFromAPI();
  }

  getPaginatedReqFromAPI() {
    this.isLoading = true;
    this._AssistanceRequestService.GetPaginatedAssistanceRequests(this.currentPage, this.itemsPerPage).subscribe({
      next: (response) => {
        // جلب جميع الطلبات بغض النظر عن حالتها
        this.otherHelpRequests = response.data || [];
        this.filteredProjects = [...this.otherHelpRequests];
        this.totalCount = response.totalCount || 0;
        this.currentPage = response.currentPage || 1;
        this.totalPages = response.totalPages || 1;
        this.isLoading = false;
        console.log(this.otherHelpRequests);
      },
      error: (err) => {
        this.isLoading = false;
        Swal.fire({
          icon: "error",
          title: "خطأ",
          text: err.message || "حدث خطأ أثناء جلب الطلبات",
          confirmButtonColor: "#f6a026",
          confirmButtonText: "حسنا",
        });
        console.error('حدث خطأ أثناء جلب الطلبات:', err);
      }
    });
  }

  get paginatedProjects() {
    return this.filteredProjects;
  }

  get displayedPages(): number[] {
    const pages: number[] = [];
    const total = this.totalPages || 1;
    const maxPagesToShow = 5;
    const half = Math.floor(maxPagesToShow / 2);

    let start = Math.max(1, this.currentPage - half);
    let end = Math.min(total, this.currentPage + half);

    if (this.currentPage <= half) {
      end = Math.min(total, maxPagesToShow);
    } else if (this.currentPage + half > total) {
      start = Math.max(1, total - maxPagesToShow + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  get showLeftDots(): boolean {
    return this.displayedPages[0] > 1;
  }

  get showRightDots(): boolean {
    return this.displayedPages[this.displayedPages.length - 1] < this.totalPages;
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.getPaginatedReqFromAPI();
    }
  }

  goToPrevious() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.getPaginatedReqFromAPI();
    }
  }

  goToNext() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.getPaginatedReqFromAPI();
    }
  }

  approve(request: Daum) {
    const updatedRequest = { ...request, requestStatus: 1 };
    this._AssistanceRequestService.UpdateReq(updatedRequest).subscribe({
      next: (response) => {
        console.log('تمت الموافقة على الطلب:', response);
        // تحديث حالة الطلب في القائمة
        const index = this.otherHelpRequests.findIndex(r => r.id === request.id);
        if (index !== -1) {
          this.otherHelpRequests[index].requestStatus = 1;
          this.filteredProjects = [...this.otherHelpRequests];
        }
        Swal.fire({
          icon: "success",
          title: "نجاح",
          text: "تم قبول الطلب بنجاح",
          confirmButtonColor: "#f6a026",
          confirmButtonText: "حسنا",
        });
      },
      error: (err) => {
        Swal.fire({
          icon: "error",
          title: "خطأ",
          text: err.message || "فشل في قبول الطلب",
          confirmButtonColor: "#f6a026",
          confirmButtonText: "حسنا",
        });
        console.error('فشل في تحديث الطلب:', err);
      }
    });
  }

  reject(request: Daum) {
    const updatedRequest = { ...request, requestStatus: 2 };
    this._AssistanceRequestService.UpdateReq(updatedRequest).subscribe({
      next: (response) => {
        console.log('تم رفض الطلب:', response);
        // تحديث حالة الطلب في القائمة
        const index = this.otherHelpRequests.findIndex(r => r.id === request.id);
        if (index !== -1) {
          this.otherHelpRequests[index].requestStatus = 2;
          this.filteredProjects = [...this.otherHelpRequests];
        }
        Swal.fire({
          icon: "success",
          title: "نجاح",
          text: "تم رفض الطلب بنجاح",
          confirmButtonColor: "#f6a026",
          confirmButtonText: "حسنا",
        });
      },
      error: (err) => {
        Swal.fire({
          icon: "error",
          title: "خطأ",
          text: err.message || "فشل في رفض الطلب",
          confirmButtonColor: "#f6a026",
          confirmButtonText: "حسنا",
        });
        console.error('فشل في تحديث الطلب:', err);
      }
    });
  }

  contact(request: Daum) {
    console.log('التواصل مع مقدم الطلب:', request);
    Swal.fire({
      icon: "info",
      title: "تواصل",
      text: `سيتم التواصل مع مدير المشروع`,
      confirmButtonColor: "#f6a026",
      confirmButtonText: "حسنا",
    });
  }
}