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
  private readonly _profile = inject(ProfileservicesService);

  otherHelpRequests: Daum[] = [];
  filteredProjects: Daum[] = [];
  userEmails: { [key: string]: string } = {}; // Map to store beneficiaryId -> email
  isLoading = false;
  email!: string;
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
        this.filteredProjects = this.otherHelpRequests;
        this.totalCount = response?.totalCount || 0;
        this.totalPages = response?.totalPages || 1;
        this.currentPage = response?.currentPage || 1;

        // Fetch user names and emails for each request
        this.otherHelpRequests.forEach(request => {
          if (request.beneficiaryId && !this.userEmails[request.beneficiaryId]) {
            this._profile.GetUserById(request.beneficiaryId).subscribe({
              next: (userResponse) => {
                
                this.userEmails[request.beneficiaryId] = userResponse?.data?.email || 'غير متوفر';
              },
              error: (err) => {
                console.error(`Error fetching user for beneficiaryId ${request.beneficiaryId}:`, err);
               
                this.userEmails[request.beneficiaryId] = 'غير متوفر';
              }
            });
          }
        });
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'خطأ',
          text: (err as any).message || 'حدث خطأ أثناء جلب الطلبات',
          confirmButtonColor: '#f6a026',
          confirmButtonText: 'حسنا'
        });
        console.log(err);
      }
    }).add(() => {
      this.isLoading = false;
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

  contact(request: any, beneficiaryId: string) {
    this._profile.GetUserById(beneficiaryId).subscribe({
      next: (userResponse) => {
        this.email = userResponse?.data?.email || '';

        if (!this.email) {
          Swal.fire({
            title: 'خطأ',
            text: 'لم يتم العثور على عنوان بريد إلكتروني للمستفيد',
            icon: 'error',
            confirmButtonColor: '#f6a026',
            confirmButtonText: 'حسنا',
          });
          return;
        }

        Swal.fire({
          title: 'إرسال للبريد الالكتروني',
          html: `
            <div dir="rtl" class="email-form-container">
              <div class="form-group mb-4">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <label for="swal-input1" class="form-label m-0">الموضوع:</label>
                </div>
                <input id="swal-input1" class="swal2-input" type="text" placeholder="أدخل الموضوع">
              </div>
              
              <div class="form-group mb-4">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <label for="swal-input2" class="form-label m-0">نص الرسالة:</label>
                </div>
                <textarea id="swal-input2" class="swal2-textarea" placeholder="أدخل نص الرسالة"></textarea>
              </div>
              
              <div class="form-group mb-4">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <label for="swal-input3" class="form-label m-0">المرفقات:</label>
                </div>
                <div class="file-upload-wrapper">
                  <input id="swal-input3" type="file" class="swal2-file">
                </div>
              </div>
            </div>
          `,
          focusConfirm: false,
          showCancelButton: true,
          confirmButtonText: 'إرسال',
          cancelButtonText: 'إلغاء',
          confirmButtonColor: '#f6a026',
          cancelButtonColor: '#6c757d',
          customClass: {
            popup: 'rtl-swal email-popup',
            title: 'email-title',
            confirmButton: 'email-confirm-btn',
            cancelButton: 'email-cancel-btn',
            input: 'email-input',
          },
          didOpen: () => {
            const fileInput = document.getElementById('swal-input3') as HTMLInputElement;
            if (fileInput) {
              fileInput.addEventListener('change', () => {
                const fileNameDisplay = document.createElement('div');
                fileNameDisplay.className = 'file-name-display';
                fileNameDisplay.textContent = fileInput.files?.length ? fileInput.files[0].name : 'لم يتم اختيار ملف';
                fileInput.parentElement?.appendChild(fileNameDisplay);
              });
            }
          },
          preConfirm: () => {
            const subject = (document.getElementById('swal-input1') as HTMLInputElement).value;
            const body = (document.getElementById('swal-input2') as HTMLTextAreaElement).value;
            const attachmentsInput = document.getElementById('swal-input3') as HTMLInputElement;
            const file = attachmentsInput.files?.length ? attachmentsInput.files[0] : null;

            if (!subject || !body) {
              Swal.showValidationMessage('يرجى ملء الموضوع ونص الرسالة');
              return false;
            }

            return { subject, body, file };
          },
        }).then((result) => {
          if (result.isConfirmed && result.value) {
            const formValues = result.value;
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
                  confirmButtonText: 'حسنا',
                });
              },
              error: (err) => {
                Swal.fire({
                  title: 'خطأ',
                  text: err.message || 'حدث خطأ أثناء إرسال البريد الإلكتروني',
                  icon: 'error',
                  confirmButtonColor: '#f6a026',
                  confirmButtonText: 'حسنا',
                });
                console.log('SendEmail Error:', err);
              },
            });
          }
        });
      },
      error: (err) => {
        Swal.fire({
          title: 'خطأ',
          text: 'حدث خطأ أثناء جلب بيانات المستفيد',
          icon: 'error',
          confirmButtonColor: '#f6a026',
          confirmButtonText: 'حسنا',
        });
        console.log('GetUserById Error:', err);
      }
    });
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