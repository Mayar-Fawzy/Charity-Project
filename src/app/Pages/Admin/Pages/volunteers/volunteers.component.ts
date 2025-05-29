import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { VolunteerActivityssService } from './core/Services/volunteer-activityss.service';
declare var bootstrap: any;

interface PaginatedResponse {
  statusCode: number;
  isSucceeded: boolean;
  message: string;
  errors: string;
  data: VolunteerApplication[];
  totalCount?: number;
}

interface VolunteerApplication {
  id: string;
  volunteerId: string;
  requestDetails: string | null;
  volunteerActivityId: string;
  projectId: string | null;
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

interface Activity {
  id: string;
  name: string;
  description: string;
}

interface Volunteer {
  id: string;
  projectId?: string;
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
  type: 'projects' | 'activities';
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
  selectedType: 'projects' | 'activities' = 'projects';
  statusFilter: number = 1;
  tabs = [
    { label: 'معلق', value: 3 },
    { label: 'مقبول', value: 1 },
    { label: 'مرفوض', value: 2 }
  ];
  selectedTab = 1;
  currentPage = 1;
  pageSize = 3;
  totalItems = 0;
  totalPages = 0;
  volunteers: Volunteer[] = [];
  filteredVolunteers: Volunteer[] = [];
  selectedImage: string | null = null;
  errorMessage: string | null = null;

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
            const rawVolunteers = response.data || [];
            this.totalItems = response.totalCount || rawVolunteers.length;
            this.totalPages = Math.ceil(this.totalItems / this.pageSize);

            const observables = rawVolunteers.map((volunteer: VolunteerApplication) => {
              console.log('Raw volunteer data:', volunteer); // تتبع البيانات الخام
              if (!volunteer.volunteerId || !volunteer.volunteerActivityId) {
                return of({
                  ...volunteer,
                  user: { data: { firstName: 'غير معروف', lastName: '', email: 'غير متوفر', phoneNumber: 'غير متوفر', gender: 0, imageUrl: '' } },
                  projectOrActivity: null,
                  type: volunteer.projectId ? 'projects' : 'activities'
                });
              }

              const user$ = this.volunteerService.GetUserById(volunteer.volunteerId);

              if (volunteer.projectId) {
                const project$ = this.volunteerService.GetProjectById(volunteer.projectId).pipe(
                  catchError(error => {
                    console.error('Error fetching project:', error, 'for projectId:', volunteer.projectId);
                    return of({ data: { name: 'غير متوفر', description: 'غير متوفر' } });
                  })
                );
                return forkJoin([user$, project$]).pipe(
                  map(([user, project]) => {
                    console.log('Project data for projectId:', volunteer.projectId, project);
                    return {
                      ...volunteer,
                      user: user,
                      projectOrActivity: project.data,
                      type: 'projects'
                    };
                  })
                );
              } else {
                return this.volunteerService.GetVolunteerActivityById(volunteer.volunteerActivityId).pipe(
                  switchMap(activity => {
                    return forkJoin([user$, of(activity)]).pipe(
                      map(([user, activity]) => {
                        console.log('Activity data for volunteerActivityId:', volunteer.volunteerActivityId, activity);
                        return {
                          ...volunteer,
                          user: user,
                          projectOrActivity: activity.data,
                          type: 'activities'
                        };
                      }),
                      catchError(error => {
                        console.error('Error fetching activity:', error, 'for volunteerActivityId:', volunteer.volunteerActivityId);
                        return of({
                          ...volunteer,
                          user: user$,
                          projectOrActivity: { name: 'غير متوفر', description: 'غير متوفر' },
                          type: 'activities'
                        });
                      })
                    );
                  })
                );
              }
            });

            forkJoin(observables).subscribe({
              next: (detailedVolunteers: any[]) => {
                this.volunteers = detailedVolunteers.map(v => ({
                  id: v.id,
                  projectId: v.projectId || undefined,
                  name: v.user?.data ? `${v.user.data.firstName} ${v.user.data.lastName}` : 'غير معروف',
                  email: v.user?.data?.email || 'غير متوفر',
                  phone: v.user?.data?.phoneNumber || 'غير متوفر',
                  gender: v.user?.data?.gender != null ? Number(v.user.data.gender) : 0,
                  age: v.user?.data?.age || null,
                  imageUrl: v.user?.data?.imageUrl || (v.user?.data?.gender === 0 ? '/Images/undraw_male-avatar_zkzx.svg' : '/Images/undraw_female-avatar_7t6k.svg'),
                  projectAddress: v.type === 'projects' ? (v.projectOrActivity?.name || 'غير متوفر') : 'غير متوفر',
                  projectDescription: v.type === 'projects' ? (v.projectOrActivity?.description || 'غير متوفر') : 'غير متوفر',
                  requestStatus: v.requestStatus,
                  volunteerId: v.volunteerId,
                  volunteerActivityId: v.volunteerActivityId,
                  createdDate: v.createdDate || 'غير متوفر',
                  type: v.type
                }));
                console.log('All volunteers after mapping:', this.volunteers); // تتبع المتطوعين بعد الخريطة
                this.filterVolunteers();
                this.isLoading = false;
              },
              error: (err) => {
                this.errorMessage = 'فشل تحميل تفاصيل المتطوعين.';
                this.isLoading = false;
                console.error('ForkJoin error:', err);
              }
            });
          } else {
            this.errorMessage = response.message || 'فشل تحميل البيانات.';
            this.isLoading = false;
          }
        },
        error: (err) => {
          this.errorMessage = 'حدث خطأ أثناء تحميل المتطوعين.';
          this.isLoading = false;
          console.error('API error:', err);
        }
      });
  }

  goToPrevious(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadVolunteers();
    }
  }

  goToNext(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadVolunteers();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadVolunteers();
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

  get showLeftDots(): boolean {
    return this.displayedPages.length > 0 && this.displayedPages[0] > 1;
  }

  get showRightDots(): boolean {
    return this.displayedPages.length > 0 && this.displayedPages[this.displayedPages.length - 1] < this.totalPages;
  }

  filterVolunteers(): void {
    console.log('Filtering for type:', this.selectedType, 'with volunteers:', this.volunteers); // تتبع التصفية
    this.filteredVolunteers = this.volunteers.filter(volunteer => {
      if (this.selectedType === 'projects') {
        return volunteer.type === 'projects' && volunteer.projectId !== null && volunteer.projectId !== undefined;
      } else {
        return volunteer.type === 'activities' && (volunteer.projectId === null || volunteer.projectId === undefined);
      }
    });
    console.log('Filtered volunteers:', this.filteredVolunteers); // تتبع المتطوعين المصفاة
  }

  changeTab(type: 'projects' | 'activities'): void {
    this.selectedType = type;
    this.filterVolunteers();
  }

  onTabChange(tabValue: number): void {
    this.selectedTab = tabValue;
    this.currentPage = 1;
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
      if (modal) modal.hide();
    }
    this.selectedImage = null;
  }

  acceptVolunteer(volunteer: Volunteer): void {
    const updated = {
      id: volunteer.id,
      volunteerId: volunteer.volunteerId,
      requestDetails: null,
      volunteerActivityId: volunteer.volunteerActivityId,
      requestStatus: 1
    };
    this.updateVolunteerStatus(updated);
  }

  rejectVolunteer(volunteer: Volunteer): void {
    const updated = {
      id: volunteer.id,
      volunteerId: volunteer.volunteerId,
      requestDetails: null,
      volunteerActivityId: volunteer.volunteerActivityId,
      requestStatus: 2
    };
    this.updateVolunteerStatus(updated);
  }

  updateVolunteerStatus(volunteer: any): void {
    this.volunteerService.UpdateVolunteerStatus(volunteer).subscribe({
      next: (res) => {
        if (res.isSucceeded) {
          this.loadVolunteers();
        } else {
          this.errorMessage = 'فشل في تحديث الحالة.';
        }
      },
      error: (err) => {
        this.errorMessage = 'حدث خطأ في تحديث الحالة.';
        console.error(err);
      }
    });
  }

  contactVolunteer(volunteer: Volunteer): void {
    window.location.href = `mailto:${volunteer.email}`;
  }
}