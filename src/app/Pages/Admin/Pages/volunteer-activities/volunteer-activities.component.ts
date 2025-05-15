import { Component, ViewChild, inject } from '@angular/core';
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
  sortedActivities: IVolunteerActivities[] = [];
  sortOrder: string = 'newest';
  activityForm: Partial<IVolunteerActivities> = {
    name: '',
    activityDescription: ''
  };
  selectedActivity: IVolunteerActivities | null = null;

  // Pagination properties
  pageSize: number = 18;
  currentPage: number = 1;
  totalCount: number = 0;
  totalPages: number = 0;
  orderByDirection: number = 1;

  // Modal-related properties
  selectedDescription: string = '';
  @ViewChild('descriptionModal') descriptionModal: any;

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
      
        },
        error: (err) => {
          console.error('Error fetching activities:', err);
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
    const organizerId = this._loginService.donorId || 'default-organizer-id';

    if (this.selectedActivity) {
      // Update existing activity
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
          }
        },
        error: (err) => {
          console.error('Error updating activity:', err);
        }
      });
    } else {
      // Create new activity
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
          }
        },
        error: (err) => {
          console.error('Error creating activity:', err);
        }
      });
    }
  }

  
 deleteActivity(activitytId: string): void {
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
         this._volunteerActivityService.Delete(activitytId).subscribe({
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
  
  openDescriptionModal(description: string): void {
    this.selectedDescription = description;
    this._modalService.open(this.descriptionModal);
  }
}