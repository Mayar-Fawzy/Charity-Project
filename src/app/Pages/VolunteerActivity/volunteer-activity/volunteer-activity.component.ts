import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IDataa, IvolunteerActivity } from '../Core/InterFace/ivolunteer-activity';
import { VolunteerActivityService } from '../Core/Services/volunteer-activity.service';
import { LoginService } from '../../Auth/core/Services/login.service';
import Swal from 'sweetalert2';
import { ProjectService } from '../../volunteer/core/Services/project.service';

@Component({
  selector: 'app-volunteer-activity',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './volunteer-activity.component.html',
  styleUrls: ['./volunteer-activity.component.scss']
})
export class VolunteerActivityComponent {
  volunteerProjectss:IDataa[] = [];
    filteredProjects: IDataa[] = [];
    
  selectedProjectId: string = '';
    itemsPerPage = 6;
    currentPage = 1;
    totalPages = 1;
    totalCount = 0;
      private readonly loginService = inject(LoginService);
      
      private readonly projectService = inject(ProjectService);
      userData: any = null;

  private readonly _volunteerActivityService= inject(VolunteerActivityService);
   ngOnInit(): void {
     this.getVoulnteerActivity();
   }
   getVoulnteerActivity(){
    this._volunteerActivityService.GetPaginatedVolunteerActivity(this.currentPage, this.itemsPerPage).subscribe((res:IvolunteerActivity) => {
      this.volunteerProjectss = res.data;
      console.log(this.volunteerProjectss);
      this.filteredProjects = [...this.volunteerProjectss];
      this.totalCount = res.totalCount;
      this.currentPage = res.currentPage;
      this.totalPages = res.totalPages;   
    }
    ,(err) => {
      console.error('حدث خطأ أثناء جلب الأنشطة التطوع ية:', err);
    });
  
   }
 

  selectedDescription: string | null = null;

  truncate(text: string, limit: number): string {
    return text.length > limit ? text.slice(0, limit) + '...' : text;
  }

  openModal(description: string): void {
    this.selectedDescription = description;

    setTimeout(() => {
      const modalElement = document.getElementById('descriptionModal');
      if (modalElement) {
        const modal = new (window as any).bootstrap.Modal(modalElement);
        modal.show();
      }
    }, 0);
  }
  //CreateVolunteerActivity
  onJoinVoulnteerActivity(projectId: string): void {
    this.selectedProjectId = projectId;
    console.log('Selected Project ID:', this.selectedProjectId);
    this.goToVolunteerAssest();
  }
  goToVolunteerAssest() {
    this.userData = this.loginService.saveUserAuth();
     
       if (!this.userData) {
         Swal.fire({
           icon: 'warning',
           title: 'يجب تسجيل الدخول',
           text: 'يرجى تسجيل الدخول أولاً لتقديم طلب التطوع.',
           confirmButtonColor: '#f6a026',
           confirmButtonText: 'حسنا',
         })
         return;
       }
     
       const volunteerAppBody = {
        volunteerId: this.userData["http://schemas.microsoft.com/ws/2008/06/identity/claims/primarysid"],
        requestDetails: null, // يمكن استبدالها لاحقًا بمدخل من المستخدم
        volunteerActivityId: this.selectedProjectId,
        projectId: null
       };
     
       this.projectService.CreateVolunteerApplication(volunteerAppBody).subscribe(res => {
         if (res.isSucceeded) {
           Swal.fire({
             icon: 'success',
             title: 'تم تقديم طلب التطوع بنجاح!',
             text: 'سيتم مراجعه طلبك قريبًا',
             confirmButtonColor: '#f6a026',
             confirmButtonText: 'حسنا',
           });
         } else {
           Swal.fire({
             icon: 'error',
             title: 'فشل تقديم الطلب',
             text: res.message || 'حدث خطأ أثناء تقديم الطلب. يرجى المحاولة لاحقًا.',
             confirmButtonColor: '#f6a026',
             confirmButtonText: 'حسنا',
           });
           console.error('Error creating volunteer application:', res.message);
         }
       });
  }
  //Pageination
  get paginatedProjects() {
    return this.filteredProjects;
  }

  get displayedPages(): number[] {
    const pages: number[] = [];
    const total = this.totalPages;
    const maxPagesToShow = 5;
    const half = Math.floor(maxPagesToShow / 2);

    let start = Math.max(1, this.currentPage - half);
    let end = Math.min(total, this.currentPage + half);

    // ضبط النطاق إذا كان الصفحة الحالية قريبة من البداية أو النهاية
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

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.getVoulnteerActivity();
    }
  }

  goToPrevious() {
    // الاعتماد على hasPreviousPage من الـ API
    if (this.currentPage > 1) {
      this.currentPage--;
      this.getVoulnteerActivity();
    }
  }

  goToNext() {
    // الاعتماد على hasNextPage من الـ API
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.getVoulnteerActivity();
    }
  }
}
