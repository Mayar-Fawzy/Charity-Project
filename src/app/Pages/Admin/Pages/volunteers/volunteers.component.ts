import { Component, OnInit, inject } from '@angular/core';
import { VolunteerActivityssService } from './core/Services/volunteer-activityss.service';
import { Observable, forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { ProfileservicesService } from '../../../../settings/Core/Services/profileservices.service';

@Component({
  selector: 'app-volunteers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './volunteers.component.html',
  styleUrls: ['./volunteers.component.scss'],
})
export class VolunteersComponent implements OnInit {
  selectedType: string = 'projects'; // Default to projects
  tabs = [
    { label: 'قيد الانتظار', value: 3 }, // Pending
    { label: 'مقبول', value: 1 }, // Accepted
    { label: 'مرفوض', value: 2 }, // Rejected
  ];
  selectedTab: number = 3; // Default to Pending
  isLoading: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  filteredVolunteers: any[] = [];
  currentPage: number = 1;
  pageSize: number = 3;
  totalPages: number = 1;
  displayedPages: number[] = [];
  showLeftDots: boolean = false;
  showRightDots: boolean = false;
  selectedImage: string | null = null;
  email: string = ''; // Declare email property

  private readonly _profile = inject(ProfileservicesService);
  constructor(private volunteerService: VolunteerActivityssService) {}

  ngOnInit(): void {
    this.loadVolunteers(this.selectedType, this.selectedTab, this.currentPage);
  }

  loadVolunteers(type: string, requestStatus: number, page: number): void {
    this.isLoading = true;

    this.errorMessage = null;
    this.successMessage = null;

    const serviceCall =
      type === 'projects'
        ? this.volunteerService.GetProjectsPaginatedByRequestStatus(
            requestStatus,
            page,
            this.pageSize,
            1
          )
        : this.volunteerService.GetActivitiesPaginatedByRequestStatus(
            requestStatus,
            page,
            this.pageSize,
            1
          );

    serviceCall.pipe(finalize(() => (this.isLoading = false))).subscribe({
      next: (response: any) => {
        if (response.isSucceeded && response.data && response.data.length > 0) {
          this.fetchVolunteerDetails(response.data, type);
          this.updatePagination(response.totalPages, page);
          this.errorMessage = null;
          setTimeout(() => {
            this.successMessage = null;
          }, 1000);
        } else {
          this.filteredVolunteers = [];
          this.errorMessage = response.message || 'لا توجد طلبات تطوع حالياً';
          this.successMessage = null;
        }
      },
      error: (err) => {
        const status = err.status;

        if (status === 0) {
          this.errorMessage = 'لا يمكن الاتصال بالخادم.';
        } else if (status === 400) {
          this.errorMessage = 'طلب غير صالح.';
        } else if (status === 401 || status === 403) {
          this.errorMessage = 'غير مصرح لك.';
        } else if (status === 404) {
          this.errorMessage = 'لا توجد طلبات تطوع حالياً';
        } else if (status === 500) {
          this.errorMessage = 'حدث خطأ في الخادم.';
        } else {
          this.errorMessage = 'حدث خطأ أثناء تحميل البيانات.';
        }

        this.filteredVolunteers = [];
        this.successMessage = null;

        console.error(err);
      },
    });
  }

  // Fetch additional details for each volunteer application
  fetchVolunteerDetails(applications: any[], type: string): void {
    const requests: Observable<any>[] = applications.map((app) =>
      forkJoin({
        user: this.volunteerService.GetUserById(app.volunteerId),
        details:
          type === 'projects'
            ? this.volunteerService.GetProjectById(app.projectId)
            : this.volunteerService.GetVolunteerActivityById(
                app.volunteerActivityId
              ),
      })
    );

    forkJoin(requests).subscribe({
      next: (results: any[]) => {
        this.filteredVolunteers = applications.map((app, index) => {
          const userData = results[index].user?.data;
          const gender = userData?.gender ?? 2; // Default to 2 (unspecified) if no gender
          const imageUrl =
            userData?.imageUrl ||
            (gender === 0
              ? '/Images/undraw_male-avatar_zkzx.svg'
              : '/Images/undraw_female-avatar_7t6k.svg');

          return {
            id: app.id,
            volunteerId: app.volunteerId,
            volunteerActivityId: app.volunteerActivityId,
            projectId: app.projectId,
            firstName: userData?.firstName || 'غير معروف',
            email: userData?.email || 'غير متوفر',
            phone: userData?.phoneNumber || 'غير متوفر',
            gender: gender,
            imageUrl: imageUrl,
            projectAddress: results[index].details?.data?.name || 'غير متوفر',
            projectDescription:
              results[index].details?.data?.description ||
              results[index].details?.data?.activityDescription ||
              'غير متوفر',
            // createdDate: app.createdDate || null,
            requestStatus: app.requestStatus,
          };
        });
      },
      error: (err) => {
        this.errorMessage = 'حدث خطأ أثناء تحميل تفاصيل المتطوعين';
        console.error(err);
      },
    });
  }

  // Handle tab change (Pending, Accepted, Rejected)
  onTabChange(tabValue: number): void {
    this.selectedTab = tabValue;
    this.currentPage = 1; // Reset to first page
    this.loadVolunteers(this.selectedType, this.selectedTab, this.currentPage);
  }

  // Handle tab change for main tabs (activities/projects)
  changeTab(type: string): void {
    this.selectedType = type;
    this.selectedTab = 3; // Reset to Pending
    this.currentPage = 1;
    this.loadVolunteers(this.selectedType, this.selectedTab, this.currentPage);
  }

  // Pagination methods
  updatePagination(totalPages: number, currentPage: number): void {
    this.totalPages = totalPages;
    const maxPagesToShow = 5;
    let startPage: number, endPage: number;

    if (this.totalPages <= maxPagesToShow) {
      startPage = 1;
      endPage = this.totalPages;
    } else {
      const maxPagesBeforeCurrent = Math.floor(maxPagesToShow / 2);
      const maxPagesAfterCurrent = Math.ceil(maxPagesToShow / 2) - 1;

      if (currentPage <= maxPagesBeforeCurrent) {
        startPage = 1;
        endPage = maxPagesToShow;
      } else if (currentPage + maxPagesAfterCurrent >= this.totalPages) {
        startPage = this.totalPages - maxPagesToShow + 1;
        endPage = this.totalPages;
      } else {
        startPage = currentPage - maxPagesBeforeCurrent;
        endPage = currentPage + maxPagesAfterCurrent;
      }
    }

    this.displayedPages = Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i
    );
    this.showLeftDots = startPage > 1;
    this.showRightDots = endPage < this.totalPages;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadVolunteers(
        this.selectedType,
        this.selectedTab,
        this.currentPage
      );
    }
  }

  goToPrevious(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadVolunteers(
        this.selectedType,
        this.selectedTab,
        this.currentPage
      );
    }
  }

  goToNext(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadVolunteers(
        this.selectedType,
        this.selectedTab,
        this.currentPage
      );
    }
  }

  // Volunteer actions
  acceptVolunteer(volunteer: any): void {
    Swal.fire({
      title: 'هل أنت متأكد؟',
      text: 'هل تريد قبول هذا المتطوع؟',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#f6a026',
      confirmButtonText: 'قبول',
      cancelButtonText: 'إلغاء',
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        const volunteerApplication = {
          id: volunteer.id,
          volunteerId: volunteer.volunteerId,
          requestDetails: null,
          volunteerActivityId:
            this.selectedType === 'activities'
              ? volunteer.volunteerActivityId
              : null,
          projectId:
            this.selectedType === 'projects' ? volunteer.projectId : null,
          requestStatus: 1, // Accepted
        };

        // First, update the volunteer status
        this.volunteerService
          .UpdateVolunteerStatus(volunteerApplication)
          .pipe(finalize(() => (this.isLoading = false)))
          .subscribe({
            next: () => {
              // After successful status update, add the volunteer to the activity or project
              const addObservable =
                this.selectedType === 'activities'
                  ? this.volunteerService.AddVolunteerToActivity(
                      volunteer.volunteerId,
                      volunteer.volunteerActivityId
                    )
                  : this.volunteerService.AddVolunteerToProject(
                      volunteer.projectId,
                      volunteer.volunteerId
                    );

              addObservable.subscribe({
                next: () => {
                  this.successMessage = 'تم قبول المتطوع وإضافته بنجاح';
                  this.loadVolunteers(
                    this.selectedType,
                    this.selectedTab,
                    this.currentPage
                  ); // Refresh data
                },
                error: (err) => {
                  this.errorMessage = 'حدث خطأ أثناء إضافة المتطوع';
                  console.error(err);
                },
              });
            },
            error: (err) => {
              this.errorMessage = 'حدث خطأ أثناء قبول المتطوع';
              console.error(err);
            },
          });
      }
    });
  }
 rejectByUpdateVolunteer(volunteer: any): void {
  Swal.fire({
    title: 'هل أنت متأكد؟',
    text: 'هل تريد رفض هذا المتطوع؟',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#f6a026',
    confirmButtonText: 'رفض',
    cancelButtonText: 'إلغاء',
  }).then((result) => {
    if (result.isConfirmed) {
      this.isLoading = true;

      const volunteerApplication = {
        id: volunteer.id,
        volunteerId: volunteer.volunteerId,
        requestDetails: null,
        volunteerActivityId: this.selectedType === 'activities' ? volunteer.volunteerActivityId : null,
        projectId: this.selectedType === 'projects' ? volunteer.projectId : null,
        requestStatus: 2, // 2 = Rejected
      };

      this.volunteerService.UpdateVolunteerStatus(volunteerApplication).subscribe({
        next: () => {
          this.isLoading = false;
       this.loadVolunteers(
                    this.selectedType,
                    this.selectedTab,
                    this.currentPage
                  );// تحديث القائمة
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = 'حدث خطأ أثناء رفض المتطوع';
          console.error(err);
          Swal.fire('خطأ', this.errorMessage, 'error');
        },
      });
    }
  });
}

 DeleteAndRemoveVolunteer(volunteer: any): void {
  Swal.fire({
    title: 'هل أنت متأكد؟',
    text: 'هل تريد رفض هذا المتطوع؟',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#f6a026',
    confirmButtonText: 'رفض',
    cancelButtonText: 'إلغاء',
  }).then((result) => {
    if (result.isConfirmed) {
      this.isLoading = true;

      const volunteerApplication = {
        id: volunteer.id,
        volunteerId: volunteer.volunteerId,
        requestDetails: null,
        volunteerActivityId: this.selectedType === 'activities' ? volunteer.volunteerActivityId : null,
        projectId: this.selectedType === 'projects' ? volunteer.projectId : null,
        requestStatus: 2, // Rejected
      };

      this.volunteerService.UpdateVolunteerStatus(volunteerApplication).subscribe({
        next: () => {
          const removeObservable = this.selectedType === 'activities'
            ? this.volunteerService.RemoveVolunteerFromActivity(volunteer.volunteerId, volunteer.volunteerActivityId)
            : this.volunteerService.RemoveVolunteerFromProject(volunteer.projectId, volunteer.volunteerId);

          removeObservable.subscribe({
            next: () => {
              this.volunteerService.DeleteVolunteerApplication(volunteer.id).pipe(
                finalize(() => this.isLoading = false)
              ).subscribe({
                next: () => {
                  this.successMessage = 'تم رفض المتطوع وإزالته بنجاح';
                  this.loadVolunteers(this.selectedType, this.selectedTab, this.currentPage);

                  Swal.fire({
                    title: 'تم الحذف',
                    text: this.successMessage,
                    icon: 'success',
                    confirmButtonColor: '#28a745',
                    confirmButtonText: 'حسناً',
                  });
                },
                error: (error) => {
                  this.errorMessage = 'حدث خطأ أثناء حذف المتطوع';
                  console.error('DeleteVolunteerApplication Error:', error);

                  Swal.fire({
                    title: 'خطأ',
                    text: this.errorMessage,
                    icon: 'error',
                    confirmButtonColor: '#f6a026',
                    confirmButtonText: 'حسناً',
                  });
                }
              });
            },
            error: (err) => {
              this.isLoading = false;
              this.errorMessage = 'حدث خطأ أثناء إزالة المتطوع';
              console.error(err);
            }
          });
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = 'حدث خطأ أثناء رفض المتطوع';
          console.error(err);
        }
      });
    }
  });
}

  contactVolunteer(volunteer: any): void {
    this.contact(volunteer, volunteer.volunteerId);
  }

deleteVolunteer(volunteer: any): void {
  Swal.fire({
    title: 'هل أنت متأكد؟',
    text: 'هل تريد حذف هذا المتطوع نهائيًا؟',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'حذف',
    cancelButtonText: 'إلغاء',
  }).then((result) => {
    if (result.isConfirmed) {
      this.volunteerService.DeleteVolunteerApplication(volunteer.id).subscribe({
        next: () => {
          this.successMessage = 'تم حذف المتطوع بنجاح';
          this.loadVolunteers(this.selectedType, this.selectedTab, this.currentPage);

          Swal.fire({
            title: 'تم الحذف',
            text: this.successMessage,
            icon: 'success',
            confirmButtonColor: '#28a745',
            confirmButtonText: 'حسناً',
          });
        },
        error: (error) => {
          this.errorMessage = 'حدث خطأ أثناء حذف المتطوع';
          console.error('DeleteVolunteerApplication Error:', error);

          Swal.fire({
            title: 'خطأ',
            text: this.errorMessage,
            icon: 'error',
            confirmButtonColor: '#f6a026',
            confirmButtonText: 'حسناً',
          });
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
            const fileInput = document.getElementById(
              'swal-input3'
            ) as HTMLInputElement;
            if (fileInput) {
              fileInput.addEventListener('change', () => {
                const fileNameDisplay = document.createElement('div');
                fileNameDisplay.className = 'file-name-display';
                fileNameDisplay.textContent = fileInput.files?.length
                  ? fileInput.files[0].name
                  : 'لم يتم اختيار ملف';
                fileInput.parentElement?.appendChild(fileNameDisplay);
              });
            }
          },
          preConfirm: () => {
            const subject = (
              document.getElementById('swal-input1') as HTMLInputElement
            ).value;
            const body = (
              document.getElementById('swal-input2') as HTMLTextAreaElement
            ).value;
            const attachmentsInput = document.getElementById(
              'swal-input3'
            ) as HTMLInputElement;
            const file = attachmentsInput.files?.length
              ? attachmentsInput.files[0]
              : null;

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
              formData.append(
                'attachments',
                formValues.file,
                formValues.file.name
              );
            }

            this.volunteerService.SendEmail(formData).subscribe({
              next: () => {
                Swal.fire({
                  title: 'نجاح',
                  text: 'تم إرسال البريد الإلكتروني بنجاح',
                  icon: 'success',
                  confirmButtonColor: '#f6a026',
                  confirmButtonText: 'حسنا',
                });
              },
              error: (err: any) => {
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
      },
    });
  }

  // Image modal handling
  openImage(imageUrl: string): void {
    this.selectedImage = imageUrl;
    const modal = document.getElementById('imageModal');
    if (modal) {
      modal.classList.add('show');
      modal.style.display = 'block';
    }
  }

  closeImageModal(): void {
    this.selectedImage = null;
    const modal = document.getElementById('imageModal');
    if (modal) {
      modal.classList.remove('show');
      modal.style.display = 'none';
    }
  }

  // Method to get truncated description
  getTruncatedDescription(volunteer: any): string {
    return (
      (volunteer.projectDescription || 'غير متوفر').slice(0, 90) +
      (volunteer.projectDescription?.length > 90 ? '...' : '')
    );
  }
}
