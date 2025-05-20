import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssistanceRequestService } from './Core/Services/assistance-request.service';
import Swal from 'sweetalert2';
import { Daum } from './Core/Interface/iassistance-request';
import { ProfileservicesService } from '../../../../settings/Core/Services/profileservices.service';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-help-requests',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './help-requests.component.html',
  styleUrls: ['./help-requests.component.scss']
})
export class HelpRequestsComponent {
  private readonly _AssistanceRequestService = inject(AssistanceRequestService);
 private readonly _profile=inject(ProfileservicesService);
  otherHelpRequests: Daum[] = [];
  filteredProjects: Daum[] = [];
  isLoading = false;
  email!:string
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

    this._AssistanceRequestService.GetPaginatedAssistanceRequests(statusFilter, this.currentPage, this.itemsPerPage).subscribe({
      next: (response) => {
        this.otherHelpRequests = response?.data || [];
        this.filteredProjects = this.otherHelpRequests; // Server-side filtering should already handle this
        this.totalCount = response?.totalCount || 0;
        this.totalPages = response?.totalPages || 1;
        this.currentPage = response?.currentPage || 1;
        this.isLoading = false;
        console.log(response?.data);
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
        
        console.log(err);
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
    Swal.fire({
      title: 'هل أنت متأكد من قبول هذا الطلب؟',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'نعم، اقبله',
      cancelButtonText: 'إلغاء'
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedRequest = { ...request, requestStatus: 1 };
        this._AssistanceRequestService.UpdateReq(updatedRequest).subscribe({
          next: () => {
            Swal.fire('نجاح', 'تم قبول الطلب بنجاح', 'success');
            this.loadRequests();
          },
          error: (err) => {
            Swal.fire('خطأ', err.message || 'حدث خطأ أثناء قبول الطلب', 'error');
          }
        });
      }
    });
  }

  reject(request: Daum) {
    Swal.fire({
      title: 'هل أنت متأكد من رفض هذا الطلب؟',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'نعم، ارفضه',
      cancelButtonText: 'إلغاء'
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedRequest = { ...request, requestStatus: 2 };
        this._AssistanceRequestService.UpdateReq(updatedRequest).subscribe({
          next: () => {
            Swal.fire('نجاح', 'تم رفض الطلب بنجاح', 'success');
            this.loadRequests();
          },
          error: (err) => {
            Swal.fire('خطأ', err.message || 'حدث خطأ أثناء رفض الطلب', 'error');
          }
        });
      }
    });
  }

 async contact(request: Daum, beneficiaryId: string) {
  try {
    const userResponse = await lastValueFrom(this._profile.GetUserById(beneficiaryId));
    this.email = userResponse?.data?.email || '';

    if (!this.email) {
      Swal.fire({
        title: 'خطأ',
        text: 'لم يتم العثور على عنوان بريد إلكتروني للمستفيد',
        icon: 'error',
        confirmButtonColor: '#f6a026',
        confirmButtonText: 'حسنا'
      });
      return;
    }

    const { value: formValues } = await Swal.fire({
      title: 'إرسال بريد إلكتروني',
      html:
        '<input id="swal-input1" class="swal2-input" placeholder="الموضوع">' +
        '<textarea id="swal-input2" class="swal2-textarea" placeholder="نص الرسالة"></textarea>' +
        '<input id="swal-input3" type="file" class="swal2-file" placeholder="المرفقات">',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'إرسال',
      cancelButtonText: 'إلغاء',
      confirmButtonColor: '#f6a026',
      cancelButtonColor: '#3085d6',
      preConfirm: () => {
        const subject = (document.getElementById('swal-input1') as HTMLInputElement).value;
        const body = (document.getElementById('swal-input2') as HTMLTextAreaElement).value;
        const attachmentsInput = (document.getElementById('swal-input3') as HTMLInputElement);
        const file = attachmentsInput.files?.length ? attachmentsInput.files[0] : null;

        if (!subject || !body) {
          Swal.showValidationMessage('يرجى ملء الموضوع ونص الرسالة');
          return false;
        }

        return { subject, body, file };
      }
    });

    if (formValues) {
      const formData = new FormData();
      formData.append('to', this.email);
      formData.append('subject', formValues.subject);
      formData.append('body', formValues.body);
      if (formValues.file) {
        formData.append('attachments', formValues.file, formValues.file.name);
      }

      this._AssistanceRequestService.SendEmail(formData).subscribe({
        next: () => {
          Swal.fire({
            title: 'نجاح',
            text: 'تم إرسال البريد الإلكتروني بنجاح',
            icon: 'success',
            confirmButtonColor: '#f6a026',
            confirmButtonText: 'حسنا'
          });
        },
        error: (err) => {
          Swal.fire({
            title: 'خطأ',
            text: err.message || 'حدث خطأ أثناء إرسال البريد الإلكتروني',
            icon: 'error',
            confirmButtonColor: '#f6a026',
            confirmButtonText: 'حسنا'
          });
          console.log('SendEmail Error:', err);
        }
      });
    }
  } catch (error) {
    Swal.fire({
      title: 'خطأ',
      text: 'حدث خطأ أثناء جلب بيانات المستفيد',
      icon: 'error',
      confirmButtonColor: '#f6a026',
      confirmButtonText: 'حسنا'
    });
    console.log('GetUserById Error:', error);
  }
}

  getStatusText(status: number): string {
    switch (status) {
      case 1:
        return 'تم القبول';
      case 2:
        return 'تم الرفض';
      case 3:
        return 'قيد المراجعة';
      default:
        return 'غير معروف';
    }
  }
}