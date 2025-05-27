import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VolunteerActivityssService } from './core/Services/volunteer-activityss.service';
import { forkJoin, of, Observable } from 'rxjs';

declare var bootstrap: any;

interface PaginatedResponse {
  statusCode: number;
  isSucceeded: boolean;
  message: string;
  errors: string;
  data: VolunteerApplication[];
}

interface VolunteerApplication {
  id: string;
  volunteerId: string;
  requestDetails: string | null;
  volunteerActivityId: string;
  projectId: string | null; // Updated to allow null
  requestStatus: number;
  createdDate: string;
  modifiedDate: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  age: number;
  gender: number;
  imageUrl: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
}

interface Volunteer {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: number;
  age: number | null;
  imageUrl: string;
  projectAddress: string;
  projectDescription: string;
  requestStatus: number;
  volunteerId: string;
  volunteerActivityId: string;
  createdDate: string;
}

interface VolunteerDetails {
  user: { data: User };
  project?: { data: Project };
}

@Component({
  selector: 'app-volunteers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './volunteers.component.html',
  styleUrls: ['./volunteers.component.scss']
})
export class VolunteersComponent implements OnInit {
  isLoading = false;
  errorMessage: string | null = null;
  tabs = [
    { label: 'معلق', value: 1 },
    { label: 'مقبول', value: 2 },
    { label: 'مرفوض', value: 3 }
  ];
  selectedTab = 1;
  filteredVolunteers: Volunteer[] = [];
  totalPages = 0;
  totalCount = 0;
  currentPage = 1;
  pageSize = 5;
  selectedImage: string | null = null;
  volunteers: VolunteerApplication[] = [];

  constructor(private volunteerService: VolunteerActivityssService) {}

  ngOnInit(): void {
    this.loadVolunteers();
  }

loadVolunteers(): void {
  this.isLoading = true;
  this.errorMessage = null;

  this.volunteerService
    .GetPaginatedByRequestStatus(this.selectedTab, this.currentPage, this.pageSize)
    .subscribe({
      next: (response: PaginatedResponse) => {
        if (response.isSucceeded) {
          this.volunteers = response.data;
          this.totalCount = response.data.length; // Replace with response.totalCount if API provides it
          this.totalPages = Math.ceil(this.totalCount / this.pageSize);

          const volunteerDetails$ = this.volunteers.map((volunteer: VolunteerApplication) => {
            const requests: { user: Observable<any>; project?: Observable<any> } = {
              user: this.volunteerService.GetUserById(volunteer.volunteerId)
            };
            if (volunteer.projectId) {
              requests['project'] = this.volunteerService.GetProjectById(volunteer.projectId);
            }
            return forkJoin(requests);
          });

          forkJoin(volunteerDetails$).subscribe({
            next: (details: VolunteerDetails[]) => {
              this.filteredVolunteers = this.volunteers.map((volunteer: VolunteerApplication, index: number) => {
                const user = details[index].user.data;
                const project = volunteer.projectId ? details[index].project?.data : null;
                return {
                  id: volunteer.id,
                  name: user ? `${user.firstName} ${user.lastName}` : 'غير معروف',
                  email: user?.email || 'غير متوفر',
                  phone: user?.phoneNumber || 'غير متوفر',
                  gender: user?.gender != null ? Number(user.gender) : 0,
                  age: user?.age || null,
                  imageUrl: user?.imageUrl || (user?.gender === 0 ?  '/Images/undraw_male-avatar_zkzx.svg':'/Images/undraw_female-avatar_7t6k.svg' ),
                  projectAddress: project?.name || 'غير متوفر',
                  projectDescription: project?.description || 'غير متوفر',
                  requestStatus: volunteer.requestStatus,
                  volunteerId: volunteer.volunteerId,
                  volunteerActivityId: volunteer.volunteerActivityId,
                  createdDate: volunteer.createdDate || 'غير متوفر'
                };
              });
              this.isLoading = false;
            },
            error: (err: any) => {
              this.errorMessage = 'حدث خطأ أثناء جلب تفاصيل المتطوعين.';
              this.isLoading = false;
              console.error(err);
            }
          });
        } else {
          this.errorMessage = response.message || 'فشل في جلب البيانات.';
          this.isLoading = false;
        }
      },
      error: (err: any) => {
        this.errorMessage = 'حدث خطأ أثناء جلب البيانات.';
        this.isLoading = false;
        console.error(err);
      }
    });
}

  onTabChange(tabValue: number): void {
    this.selectedTab = tabValue;
    this.currentPage = 1;
    this.loadVolunteers();
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadVolunteers();
  }

  openImage(image: string): void {
    this.selectedImage = image;
    const modalElement = document.getElementById('imageModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  closeImageModal(): void {
    const modalElement = document.getElementById('imageModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
    this.selectedImage = null;
  }

  acceptVolunteer(volunteer: Volunteer): void {
    const updatedVolunteer = {
      id: volunteer.id,
      volunteerId: volunteer.volunteerId,
      requestDetails: null,
      volunteerActivityId: volunteer.volunteerActivityId,
      requestStatus: 2
    };
    this.updateVolunteerStatus(updatedVolunteer);
  }

  rejectVolunteer(volunteer: Volunteer): void {
    const updatedVolunteer = {
      id: volunteer.id,
      volunteerId: volunteer.volunteerId,
      requestDetails: null,
      volunteerActivityId: volunteer.volunteerActivityId,
      requestStatus: 3
    };
    this.updateVolunteerStatus(updatedVolunteer);
  }

  updateVolunteerStatus(volunteer: any): void {
    this.volunteerService.UpdateVolunteerStatus(volunteer).subscribe({
      next: (response: PaginatedResponse) => {
        if (response.isSucceeded) {
          this.loadVolunteers();
        } else {
          this.errorMessage = 'فشل في تحديث حالة المتطوع.';
        }
      },
      error: (err: any) => {
        this.errorMessage = 'حدث خطأ أثناء تحديث حالة المتطوع.';
        console.error(err);
      }
    });
  }

  contactVolunteer(volunteer: Volunteer): void {
    window.location.href = `mailto:${volunteer.email}`;
  }
}