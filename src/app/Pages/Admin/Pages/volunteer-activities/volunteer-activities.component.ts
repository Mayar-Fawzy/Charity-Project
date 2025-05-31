import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { VolunteerActivitySService } from './Core/Services/volunteer-activity-s.service';
import { IVolunteerActivities, IGetPaginatedVolunteerActivities, ICreateVolunteerActivity, IUpdateVolunteerActivity } from './Core/Interfaces/volunter-activity';
import { LoginService } from '../../../Auth/core/Services/login.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-volunteer-activities',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './volunteer-activities.component.html',
  styleUrl: './volunteer-activities.component.scss'
})
export class VolunteerActivitiesComponent {
  private readonly _modalService = inject(NgbModal);
  private readonly _loginService = inject(LoginService);
  private readonly _volunteerActivityService = inject(VolunteerActivitySService);
  volunteerActivities: IVolunteerActivities[] = [];
  isLoading: boolean = false;
  sortOrder: string = 'newest'; // 'newest' = descending createdDate, 'oldest' = ascending createdDate
  activityForm: Partial<IVolunteerActivities> = {
    name: '',
    activityDescription: ''
  };
  selectedActivity: IVolunteerActivities | null = null;

  // Pagination properties
  pageSize: number = 6;
  currentPage: number = 1;
  totalCount: number = 0;
  totalPages: number = 0;
  orderByDirection: number = 1; // Used for server-side alphabetical sorting by name (1 = asc, 2 = desc)

  ngOnInit() {
    this.fetchActivities();
  }

  fetchActivities() {
  
    this._volunteerActivityService
      .GetPaginatedVolunteerActivities(this.currentPage, this.pageSize, this.orderByDirection)
      .subscribe({
        next: (response: IGetPaginatedVolunteerActivities) => {
          this.volunteerActivities = response.data.map((activity: IVolunteerActivities) => ({
            id: activity.id,
            organizerId: activity.organizerId,
            name: activity.name,
            activityDescription: activity.activityDescription,
            createdDate: activity.createdDate,
            modifiedDate: activity.modifiedDate
          }));
          this.totalCount = response.totalCount;
          this.totalPages = response.totalPages;
          this.currentPage = response.currentPage;
          // Apply client-side sorting by createdDate
          this.sortActivitiesClientSide();
        },
        error: (err) => {
          console.error('Error fetching activities:', err);
          Swal.fire('خطأ!', 'حدث خطأ أثناء جلب الأنشطة.', 'error');
        }
      });
  }

  openAddModal(content: any) {
    this.selectedActivity = null;
    this.activityForm = { name: '', activityDescription: '' };
    this._modalService.open(content);
  }

  openEditModal(activity: IVolunteerActivities, content: any) {
    this.selectedActivity = activity;
    this.activityForm = { ...activity };
    this._modalService.open(content);
  }

  saveActivity(modal: NgbModalRef) {
    this.isLoading = true;
    const organizerId = this._loginService.donorId || 'default-organizer-id';

    if (this.selectedActivity) {
      const updateData: IUpdateVolunteerActivity = {
        id: this.selectedActivity.id,
        organizerId: organizerId,
        name: this.activityForm.name || '',
        activityDescription: this.activityForm.activityDescription || ''
      };

      this._volunteerActivityService.UpdateProject(updateData).subscribe({
        next: (response: any) => {
          if (response.isSucceeded) {
            modal.close();
            this.fetchActivities();
          } else {
            Swal.fire('خطأ!', response.message || 'فشل التحديث', 'error');
          }
        },
        error: (err) => {
          console.error('Error updating activity:', err);
          Swal.fire('خطأ!', 'حدث خطأ أثناء تحديث النشاط.', 'error');
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    } else {
      const createData: ICreateVolunteerActivity = {
        organizerId: organizerId,
        name: this.activityForm.name || '',
        activityDescription: this.activityForm.activityDescription || ''
      };

      this._volunteerActivityService.CreateVolunteerActivity(createData).subscribe({
        next: (response: any) => {
          if (response.isSucceeded) {
            modal.close();
            this.fetchActivities();
          } else {
            Swal.fire('خطأ!', response.message || 'فشل الإنشاء', 'error');
          }
        },
        error: (err) => {
          console.error('Error creating activity:', err);
          Swal.fire('خطأ!', 'حدث خطأ أثناء إنشاء النشاط.', 'error');
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }

  deleteActivity(activityId: string): void {
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
        this._volunteerActivityService.Delete(activityId).subscribe({
          next: (response) => {
            if (response.isSucceeded) {
              this.fetchActivities();
              Swal.fire('تم الحذف!', 'تم حذف العنصر بنجاح.', 'success');
            } else {
              Swal.fire('خطأ!', response.message || 'فشل الحذف', 'error');
            }
          },
          error: (error) => {
            Swal.fire('خطأ!', 'حدث خطأ أثناء حذف العنصر.', 'error');
          }
        });
      }
    });
  }

  sortActivities() {
    this.currentPage = 1;
    this.fetchActivities(); 
  }

//    new Date().getTime() عشان أحوّل التاريخ لرقم نقدر نقارن بيه.
//    لو اخترت "الأحدث" (sortOrder = 'newest')، بيترتّب من الأحدث للأقدم (يعني التاريخ الأكبر الأول).
//  لو اخترت "الأقدم" (sortOrder = 'oldest')، بيترتّب من الأقدم للأحدث (يعني التاريخ الأصغر الأول).
  sortActivitiesClientSide() {
    this.volunteerActivities.sort((a, b) => {
      const dateA = new Date(a.createdDate).getTime();
      const dateB = new Date(b.createdDate).getTime();
      return this.sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.fetchActivities();
    }
  }

  goToPrevious() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.fetchActivities();
    }
  }

  goToNext() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.fetchActivities();
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
}