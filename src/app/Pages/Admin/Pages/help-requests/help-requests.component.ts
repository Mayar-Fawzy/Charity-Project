import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssistanceRequestService } from './Core/Services/assistance-request.service';
import Swal from 'sweetalert2';
import { Daum } from './Core/Interface/iassistance-request';
import { ProfileservicesService } from '../../../../settings/Core/Services/profileservices.service';
import { lastValueFrom } from 'rxjs';
import { Environment } from '../../../Auth/core/Environment/Environment'
import { DonateNowService } from '../../../Donor/core/Services/donate-now.service'
import { UserService, User } from '../users/core/user.service';
import { ReloadInkindService } from '../../core/Shared/reload-inkind.service';
import { forkJoin, map, switchMap, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

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
  private readonly _donationService = inject(DonateNowService);
  private readonly _reloadService = inject(ReloadInkindService);
  private readonly _http = inject(HttpClient);



  constructor(private userService: UserService) { }


  mainTab: 'written' | 'items' = 'written';
  activeTab: 'pending' | 'approved' | 'rejected' = 'pending';
  itemTab: 'pending' | 'approved' | 'rejected' = 'pending';
  email: string = '';


  writtenRequests: Daum[] = [];
  itemDonations: Daum[] = [];
  filteredProjects: Daum[] = [];
  userEmails: { [key: string]: string } = {};
  isLoading = false;
  itemsPerPage = 6;
  currentPage = 1;
  totalPages = 1;
  totalCount = 0;

  ngOnInit() {
    this.loadRequests();
    this.loadVolunteersForActivity('f972d6c2-8538-48ac-9540-a3856b1699f2');
  }

  volunteers: any[] = [];

  loadVolunteersForActivity(activityId: string) {
    this._http.get<any>('https://givinghandcharity.runasp.net/api/v1/VolunteerApplication/GetAllVolunteerApplications')
      .subscribe((res: any) => {
        const applications = res?.data || [];

        const acceptedVolunteers = applications.filter((app: any) =>
          app.volunteerActivityId === activityId && app.requestStatus === 1
        );

        const requests = acceptedVolunteers.map((app: any) =>
          this._http.get<any>(`https://givinghandcharity.runasp.net/api/v1/User/GetUserById?id=${app.volunteerId}`)
        );

        Promise.all(requests.map((req: any) => req.toPromise()))
          .then((users: any[]) => {
            this.volunteers = users.map((res: any) => res.data);
            console.log(' المتطوعين:', this.volunteers);
          })
          .catch(err => console.error(' خطأ في تحميل المتطوعين', err));
      });

  }


  changeMainTab(tab: 'written' | 'items') {
    this.mainTab = tab;
    this.currentPage = 1;
    this.loadRequests();
  }

  changeTab(tab: 'pending' | 'approved' | 'rejected') {
    this.activeTab = tab;
    this.currentPage = 1;
    this.loadRequests();
  }

  changeItemTab(tab: 'pending' | 'approved' | 'rejected') {
    this.itemTab = tab;
    this.currentPage = 1;
    this.loadRequests();
  }

  changeTabByMain(tab: 'pending' | 'approved' | 'rejected') {
    this.currentPage = 1;
    if (this.mainTab === 'written') {
      this.activeTab = tab;
    } else {
      this.itemTab = tab;
    }
    this.loadRequests();
  }

  getCurrentTab(): string {
    return this.mainTab === 'written' ? this.activeTab : this.itemTab;
  }


  loadRequests() {
    this.isLoading = true;

    const isInKind = this.mainTab === 'items';
    let statusFilter: number;

    if (this.mainTab === 'written') {
      statusFilter = this.activeTab === 'pending' ? 3 : this.activeTab === 'approved' ? 1 : 2;
    } else {
      statusFilter = this.itemTab === 'pending' ? 3 : this.itemTab === 'approved' ? 1 : 2;
    }

    this._AssistanceRequestService
      .GetPaginatedByRequestStatus(isInKind, statusFilter, this.currentPage, this.itemsPerPage)
      .pipe(
        switchMap((response: any) => {
          const requests: Daum[] = response?.data || [];
          this.totalCount = response?.totalCount || 0;
          this.totalPages = response?.totalPages || 1;
          this.currentPage = response?.currentPage || 1;

          if (!isInKind) {
            this.writtenRequests = requests;
            this.filteredProjects = this.writtenRequests;
            return of(requests);
          }

          const requestsWithDonations$ = requests.map((request: Daum) => {
            return this._donationService.GetInKindDonationById(request.inKindDonationId).pipe(
              map((donation: any) => ({ ...request, ...donation.data }))
            );
          });

          return forkJoin(requestsWithDonations$);
        })
      )
      .subscribe({
        next: (merged) => {
          console.log('Merged donation:', merged);

          if (isInKind) {
            this.itemDonations = merged as Daum[];
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.writtenRequests = [];
          this.itemDonations = [];
          this.filteredProjects = [];
          this.totalCount = 0;
          this.totalPages = 1;
          this.currentPage = 1;

          if (err.status === 404) {
            console.warn('لا توجد طلبات حالياً');
          } else {
            Swal.fire('خطأ', err.message || 'حدث خطأ أثناء جلب الطلبات', 'error');
          }
        },
        complete: () => this.isLoading = false
      });
  }

  approveInKindDonation(donation: Daum) {
    Swal.fire({
      title: 'هل أنت متأكد من قبول هذا التبرع العيني؟',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'نعم، اقبله',
      cancelButtonText: 'إلغاء'
    }).then((result) => {
      if (result.isConfirmed) {
        this._AssistanceRequestService.getRequestByInKindDonationId(donation.id).subscribe(
          (request) => {
            if (request) {
              const updatedRequest = {
                ...request,
                requestStatus: 1
              };
              this._AssistanceRequestService.UpdateReq(updatedRequest).subscribe(() => {
                Swal.fire('نجاح', 'تم قبول التبرع العيني بنجاح', 'success');
                this.loadRequests();
              }, (err) => {
                Swal.fire('خطأ', err.message || 'حدث خطأ أثناء القبول', 'error');
              });
            } else {
              Swal.fire('خطأ', 'لم يتم العثور على الطلب المرتبط بهذا التبرع', 'error');
            }
          },
          (err) => {
            Swal.fire('خطأ', 'فشل في جلب بيانات الطلب', 'error');
          }
        );
      }
    });
  }



  rejectInKindDonation(donation: Daum) {
    Swal.fire({
      title: 'هل أنت متأكد من رفض هذا التبرع العيني؟',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'نعم، ارفضه',
      cancelButtonText: 'إلغاء'
    }).then((result) => {
      if (result.isConfirmed) {
        this._AssistanceRequestService.getRequestByInKindDonationId(donation.id).subscribe(
          (request) => {
            if (request) {
              const updatedRequest = {
                ...request,
                requestStatus: 2
              };
              this._AssistanceRequestService.UpdateReq(updatedRequest).subscribe(() => {
                Swal.fire('نجاح', 'تم رفض التبرع العيني بنجاح', 'success');
                this.loadRequests();
              }, (err) => {
                Swal.fire('خطأ', err.message || 'حدث خطأ أثناء الرفض', 'error');
              });
            } else {
              Swal.fire('خطأ', 'لم يتم العثور على الطلب المرتبط بهذا التبرع', 'error');
            }
          },
          (err) => {
            Swal.fire('خطأ', 'فشل في جلب بيانات الطلب', 'error');
          }
        );
      }
    });
  }

  deleteInfoInKindDonation(donation: Daum) {
    Swal.fire({
      title: 'هل أنت متأكد من حذف هذا التبرع؟',
      text: 'لا يمكن التراجع عن هذا الإجراء!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'نعم، احذفه',
      cancelButtonText: 'إلغاء'
    }).then((result) => {
      if (result.isConfirmed) {
        this._AssistanceRequestService.getRequestByInKindDonationId(donation.id).subscribe(
          (request) => {
            if (request) {
              this._AssistanceRequestService.Delete(request.id).subscribe({
                next: () => {
                  Swal.fire('تم الحذف', 'تم حذف التبرع بنجاح', 'success');
                  this.loadRequests();
                },
                error: (err) => {
                  Swal.fire('خطأ', err.message || 'حدث خطأ أثناء الحذف', 'error');
                }
              });
            } else {
              Swal.fire('خطأ', 'لم يتم العثور على الطلب المرتبط بهذا التبرع', 'error');
            }
          },
          (err) => {
            Swal.fire('خطأ', 'تعذر جلب بيانات الطلب', 'error');
          }
        );
      }
    });
  }


  showUserInfoInKindDonation(userId: string) {
    this.userService.getUserById(userId).subscribe({
      next: (user: User) => {
        let imageSrc = user.imageUrl;
        if (!imageSrc) {
          imageSrc = user.gender === 0
            ? '/Images/undraw_male-avatar_zkzx.svg'
            : '/Images/undraw_female-avatar_7t6k.svg';
        }

        Swal.fire({
          title: '',
          html: `
          <div style="text-align: center; margin-bottom: 20px;">
            <img 
              id="userImage" 
              src="${imageSrc}" 
              alt="الصورة الشخصية" 
              style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; margin-bottom: 10px; cursor: pointer;"
            >
            <h3 style="margin: 0;">${user.firstName} ${user.lastName}</h3>
          </div>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <input type="text" value="${user.email || 'غير متوفر'}" readonly style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;" placeholder="البريد">
            <input type="text" value="${user.phoneNumber || 'غير متوفر'}" readonly style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;" placeholder="رقم الهاتف">
            <input type="text" value="${user.gender === 1 ? 'أنثى' : 'ذكر'}" readonly style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;" placeholder="الجنس">
          </div>
        `,
          showCloseButton: true,
          showConfirmButton: false,
          customClass: {
            popup: 'swal2-popup-arabic'
          },
          didOpen: () => {
            const popup = Swal.getPopup();
            if (popup) {
              const img = popup.querySelector('#userImage');
              if (img) {
                img.addEventListener('click', () => {
                  Swal.fire({
                    imageUrl: imageSrc,
                    imageAlt: 'الصورة الشخصية',
                    showCloseButton: true,
                    showConfirmButton: false,
                    customClass: {
                      popup: 'swal2-popup-arabic'
                    }
                  });
                });
              }
            }
          }
        });
      },
      error: () => {
        Swal.fire('حدث خطأ', 'تعذر تحميل بيانات المستخدم', 'error');
      }
    });
  }

  confirmDistribution(donation: Daum) {
    Swal.fire({
      title: 'تأكيد توزيع التبرع',
      html: `
      <div style="text-align:right">
        <label class="form-label">اختر المتطوع</label>
        <select id="volunteerSelect" class="form-control mt-3">
          ${this.volunteers.map(v => `<option value="${v.id}">${v.firstName} ${v.lastName}</option>`).join('')}
        </select>
        <label class="form-label mt-3">الوصف</label>
        <textarea id="description" class="form-control" placeholder="الوصف (مطلوب)"></textarea>
        <label class="form-label mt-3">الكمية</label>
        <input id="quantity" type="number" class="form-control" value="${donation.quantity || 1}" min="1">
      </div>
    `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'تأكيد التوزيع',
      cancelButtonText: 'إلغاء',
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      preConfirm: () => {
        const volunteerId = (document.getElementById('volunteerSelect') as HTMLSelectElement).value;
        const description = (document.getElementById('description') as HTMLTextAreaElement).value;
        const quantityStr = (document.getElementById('quantity') as HTMLInputElement).value;
        const quantity = Number(quantityStr);

        if (!volunteerId || !description || quantity <= 0) {
          Swal.showValidationMessage('يرجى اختيار متطوع، وإدخال وصف، وكمية أكبر من 0');
          return;
        }

        return { volunteerId, description, quantity };
      }
    }).then(result => {
      if (result.isConfirmed && result.value) {
        const { volunteerId, description, quantity } = result.value;
        const originalQuantity = donation.quantity ?? 0;

        if (quantity > originalQuantity) {
          Swal.fire('خطأ', 'الكمية المطلوبة أكبر من الكمية المتاحة', 'error');
          return;
        }

        const distributionBody = {
          beneficiaryId: donation.beneficiaryId,
          inKindDonationId: donation.id,
          monetaryDonationId: null,
          volunteerId: volunteerId,
          description,
          quantity,
          amount: 0
        };

        this._AssistanceRequestService.createAidDistribution(distributionBody).subscribe({
          next: () => {
            const remainingQuantity = originalQuantity - quantity;

            if (remainingQuantity > 0) {
              const formData = new FormData();
              formData.append('id', donation.id);
              formData.append('name', donation.name || '');
              formData.append('description', donation.description || '');
              formData.append('itemType', (donation.itemType ?? 0).toString());
              formData.append('donationStatus', (donation.donationStatus ?? 0).toString());
              formData.append('quantity', remainingQuantity.toString());
              formData.append('isAllocated', (donation.isAllocated ?? false).toString());
              formData.append('donorId', donation.donorId || '');
              formData.append('projectId', donation.projectId || '');

              if (donation.imageUrls && donation.imageUrls.length > 0) {
                donation.imageUrls.forEach((url: string) => {
                  formData.append('imageUrls', url);
                });
              }

              this._AssistanceRequestService.updateInKindDonation(formData).subscribe({
                next: () => {
                  Swal.fire('تم التوزيع', 'تم تحديث كمية التبرع بنجاح', 'success');
                  this._reloadService.triggerReload();
                  this.loadRequests();
                },
                error: () => {
                  Swal.fire('تم التوزيع', 'لكن فشل تحديث الكمية', 'warning');
                  this.loadRequests();
                }
              });
            } else {
              this._AssistanceRequestService.deleteInKindDonation(donation.id).subscribe({
                next: () => {
                  Swal.fire('تم التوزيع', 'تم حذف التبرع لان الكمية أصبحت 0', 'success');
                  this._reloadService.triggerReload();
                  this.loadRequests();
                },
                error: () => {
                  Swal.fire('تم التوزيع', 'لكن فشل حذف التبرع', 'warning');
                  this.loadRequests();
                }
              });
            }
          },
          error: (err) => {
            Swal.fire('خطأ', err.message || 'حدث خطأ أثناء توزيع التبرع', 'error');
          }
        });
      }
    });
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
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  get showLeftDots() {
    return this.displayedPages.length > 0 && this.displayedPages[0] > 1;
  }

  get showRightDots() {
    return this.displayedPages.length > 0 && this.displayedPages[this.displayedPages.length - 1] < this.totalPages;
  }

  getStatusText(status: number): string {
    switch (status) {
      case 1: return 'تم القبول';
      case 2: return 'تم الرفض';
      case 3: return 'قيد المراجعة';
      default: return 'غير معروف';
    }
  }

  deleteWrittenRequest(request: Daum) {
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

  approveWrittenRequest(request: Daum) {
    Swal.fire({
      title: 'هل أنت متأكد من قبول هذا الطلب المكتوب؟',
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
            Swal.fire('نجاح', 'تم قبول الطلب المكتوب بنجاح', 'success');
            this.loadRequests();
          },
          error: (err) => {
            Swal.fire('خطأ', err.message || 'حدث خطأ أثناء قبول الطلب المكتوب', 'error');
          }
        });
      }
    });
  }

  rejectWrittenRequest(request: Daum) {
    Swal.fire({
      title: 'هل أنت متأكد من رفض هذا الطلب المكتوب؟',
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
            Swal.fire('نجاح', 'تم رفض الطلب المكتوب بنجاح', 'success');
            this.loadRequests();
          },
          error: (err) => {
            Swal.fire('خطأ', err.message || 'حدث خطأ أثناء رفض الطلب المكتوب', 'error');
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

  approveDonation(donation: Daum) {
    const updatedRequest = { ...donation, requestStatus: 1 };
    this._AssistanceRequestService.UpdateReq(updatedRequest).subscribe({
      next: () => {
        Swal.fire('نجاح', 'تم قبول التبرع بنجاح', 'success');
        this.loadRequests();
      },
      error: (err) => {
        Swal.fire('خطأ', err.message || 'حدث خطأ أثناء قبول التبرع', 'error');
      }
    });
  }

  rejectDonation(donation: Daum) {
    const updatedRequest = { ...donation, requestStatus: 2 };
    this._AssistanceRequestService.UpdateReq(updatedRequest).subscribe({
      next: () => {
        Swal.fire('نجاح', 'تم رفض التبرع بنجاح', 'success');
        this.loadRequests();
      },
      error: (err) => {
        Swal.fire('خطأ', err.message || 'حدث خطأ أثناء رفض التبرع', 'error');
      }
    });
  }


  showUserInfo(userId: string) {
    this.userService.getUserById(userId).subscribe({
      next: (user: User) => {
        let imageSrc = user.imageUrl;
        if (!imageSrc) {
          imageSrc = user.gender === 0
            ? '/Images/undraw_male-avatar_zkzx.svg'
            : '/Images/undraw_female-avatar_7t6k.svg';
        }

        Swal.fire({
          title: '',
          html: `
          <div style="text-align: center; margin-bottom: 20px;">
            <img 
              id="userImage" 
              src="${imageSrc}" 
              alt="الصورة الشخصية" 
              style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; margin-bottom: 10px; cursor: pointer;"
            >
            <h3 style="margin: 0;">${user.firstName} ${user.lastName}</h3>
          </div>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <input type="text" value="${user.email || 'غير متوفر'}" readonly style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;" placeholder="البريد">
            <input type="text" value="${user.phoneNumber || 'غير متوفر'}" readonly style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;" placeholder="رقم الهاتف">
            <input type="text" value="${user.gender === 1 ? 'أنثى' : 'ذكر'}" readonly style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;" placeholder="الجنس">
          </div>
        `,
          showCloseButton: true,
          showConfirmButton: false,
          customClass: {
            popup: 'swal2-popup-arabic'
          },
          didOpen: () => {
            const popup = Swal.getPopup();
            if (popup) {
              const img = popup.querySelector('#userImage');
              if (img) {
                img.addEventListener('click', () => {
                  Swal.fire({
                    imageUrl: imageSrc,
                    imageAlt: 'الصورة الشخصية',
                    showCloseButton: true,
                    showConfirmButton: false,
                    customClass: {
                      popup: 'swal2-popup-arabic'
                    }
                  });
                });
              }
            }
          }
        });
      },
      error: () => {
        Swal.fire('حدث خطأ', 'تعذر تحميل بيانات المستخدم', 'error');
      }
    });
  }
}