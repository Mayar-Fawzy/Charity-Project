import { Component, OnInit } from '@angular/core';
import { VolunteerActivityssService } from './core/Services/volunteer-activityss.service';
import { Observable, forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-volunteers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './volunteers.component.html',
  styleUrls: ['./volunteers.component.scss']
})
export class VolunteersComponent implements OnInit {
  selectedType: string = 'activities'; // Fixed to activities as per request
  tabs = [
    { label: 'قيد الانتظار', value: 0 }, // Pending
    { label: 'مقبول', value: 1 }, // Accepted
    { label: 'مرفوض', value: 2 }, // Rejected
  ];
  selectedTab: number = 0; // Default to Pending
  isLoading: boolean = false;
  errorMessage: string | null = null;
  filteredVolunteers: any[] = [];
  currentPage: number = 1;
  pageSize: number = 6; // Adjust as needed
  totalPages: number = 1;
  displayedPages: number[] = [];
  showLeftDots: boolean = false;
  showRightDots: boolean = false;
  selectedImage: string | null = null;

  constructor(private volunteerService: VolunteerActivityssService) {}

  ngOnInit(): void {
    this.loadVolunteers(this.selectedTab, this.currentPage);
  }

  // Load paginated volunteer applications based on request status
  loadVolunteers(requestStatus: number, page: number): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.volunteerService
      .GetProjectsPaginatedByRequestStatus(requestStatus, page, this.pageSize, 1)
      .pipe(
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: (response: any) => {
          if (response && response.data && response.data.items) {
            this.fetchVolunteerDetails(response.data.items);
            this.updatePagination(response.data.totalPages, page);
          } else {
            this.filteredVolunteers = [];
            this.errorMessage = 'لا توجد بيانات متاحة';
          }
        },
        error: (err) => {
          this.errorMessage = 'حدث خطأ أثناء تحميل البيانات';
          this.filteredVolunteers = [];
          console.error(err);
        },
      });
  }

  // Fetch additional details for each volunteer application (user and activity details)
  fetchVolunteerDetails(applications: any[]): void {
    const requests: Observable<any>[] = applications.map((app) =>
      forkJoin({
        user: this.volunteerService.GetUserById(app.volunteerId),
        activity: this.volunteerService.GetVolunteerActivityById(app.volunteerActivityId),
      })
    );

    forkJoin(requests).subscribe({
      next: (results: any[]) => {
        this.filteredVolunteers = applications.map((app, index) => ({
          id: app.id,
          volunteerId: app.volunteerId,
          volunteerActivityId: app.volunteerActivityId,
          name: results[index].user?.data?.name || 'غير معروف',
          email: results[index].user?.data?.email || 'غير متوفر',
          phone: results[index].user?.data?.phoneNumber || 'غير متوفر',
          gender: results[index].user?.data?.gender ?? 2, // 2 for unspecified
          imageUrl: results[index].user?.data?.imageUrl || 'assets/default-avatar.png',
          projectAddress: results[index].activity?.data?.address || 'غير متوفر', // Assuming activity has address
          projectDescription: results[index].activity?.data?.description || 'غير متوفر',
          createdDate: app.createdDate || null,
          requestStatus: app.requestStatus,
        }));
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
    this.loadVolunteers(this.selectedTab, this.currentPage);
  }

  // Handle tab change for main tabs (activities/projects, currently fixed to activities)
  changeTab(type: string): void {
    this.selectedType = type;
    this.selectedTab = 0; // Reset to Pending
    this.currentPage = 1;
    this.loadVolunteers(this.selectedTab, this.currentPage);
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
      this.loadVolunteers(this.selectedTab, this.currentPage);
    }
  }

  goToPrevious(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadVolunteers(this.selectedTab, this.currentPage);
    }
  }

  goToNext(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadVolunteers(this.selectedTab, this.currentPage);
    }
  }

  // Volunteer actions
  acceptVolunteer(volunteer: any): void {
    const volunteerApplication = {
      id: volunteer.id,
      volunteerId: volunteer.volunteerId,
      requestDetails: null,
      volunteerActivityId: volunteer.volunteerActivityId,
      requestStatus: 1, // Accepted
    };

    this.volunteerService.UpdateVolunteerStatus(volunteerApplication).subscribe({
      next: () => {
        this.loadVolunteers(this.selectedTab, this.currentPage); // Refresh data
      },
      error: (err) => {
        this.errorMessage = 'حدث خطأ أثناء قبول المتطوع';
        console.error(err);
      },
    });
  }

  rejectVolunteer(volunteer: any): void {
    const volunteerApplication = {
      id: volunteer.id,
      volunteerId: volunteer.volunteerId,
      requestDetails: null,
      volunteerActivityId: volunteer.volunteerActivityId,
      requestStatus: 2, // Rejected
    };

    this.volunteerService.UpdateVolunteerStatus(volunteerApplication).subscribe({
      next: () => {
        this.loadVolunteers(this.selectedTab, this.currentPage); // Refresh data
      },
      error: (err) => {
        this.errorMessage = 'حدث خطأ أثناء رفض المتطوع';
        console.error(err);
      },
    });
  }

  contactVolunteer(volunteer: any): void {
    // Placeholder for contact functionality (e.g., open email client or messaging)
    alert(`تواصل مع ${volunteer.name} على البريد: ${volunteer.email}`);
  }

  // Image modal handling
  openImage(imageUrl: string): void {
    this.selectedImage = imageUrl;
    // Assuming you're using Bootstrap's modal
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
}