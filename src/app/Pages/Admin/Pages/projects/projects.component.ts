import { Component, inject, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { GetProjj, IGetProj } from './Core/InterFace/iget-proj';
import Swal from 'sweetalert2';
import { CRUDProjService } from './Core/Services/crudproj.service';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbModule],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss'
})
export class ProjectsComponent {
 private readonly _CRUDProjService =inject(CRUDProjService)
   projectss: GetProjj[] = [];
    filteredProjects: GetProjj[] = [];
    progressPercentages: number[] = [20, 50, 75, 30, 60, 90]; // نسب تقدم مختلفة
    itemsPerPage = 6;
    currentPage = 1;
    totalPages = 1;
    totalCount = 0;
 ngOnInit() {
     this.getPaginatedProjectsFromAPI();
   }
 
   getPaginatedProjectsFromAPI() {
     this._CRUDProjService.GetPaginatedProjects(this.currentPage, this.itemsPerPage).subscribe({
       next: (response: any) => {
         this.projectss = response.data.map((project: GetProjj, index: number) => {
           return {
             ...project,
             progressPercentage: this.progressPercentages[index % this.progressPercentages.length], // تعيين نسبة تقدم ثابتة
           };
         });
         this.filteredProjects = [...this.projectss]; 
         this.totalCount = response.totalCount;
         this.currentPage = response.currentPage; 
         this.totalPages = response.totalPages;  
       console.log(this.projectss);
       },
       error: (err) => {
         Swal.fire({
           icon: "error",
           title: "خطأ",
           text: "حدث خطأ أثناء جلب المشاريع",
           confirmButtonColor: "#f6a026",
           confirmButtonText: "حسنا",
         });
         console.error('حدث خطأ أثناء جلب المشاريع:', err);
       }
     });
   }
 
  getProgressPercentage(project: any): number {
    // استخدام القيمة المخزنة بدلاً من الحساب الديناميكي
    return project.progressPercentage || 0;
  }
  //Pagination
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

  get showLeftDots(): boolean {
    return this.displayedPages[0] > 1;
  }

  get showRightDots(): boolean {
    return this.displayedPages[this.displayedPages.length - 1] < this.totalPages;
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.getPaginatedProjectsFromAPI();
    }
  }

  goToPrevious() {
    // الاعتماد على hasPreviousPage من الـ API
    if (this.currentPage > 1) {
      this.currentPage--;
      this.getPaginatedProjectsFromAPI();
    }
  }

  goToNext() {
    // الاعتماد على hasNextPage من الـ API
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.getPaginatedProjectsFromAPI();
    }
  }
  projects = [
    {
      title: 'المساعدات الغذائية',
      description: 'نظم حملة لتوزيع المساعدات الغذائية للعائلات المحتاجة.',
      progress: 0,
      goal: 600000,
      image: '/Images/Fasting-breakfast.png'
    }
  ];

  projectForm: any = {};
  selectedProject: any = null;

  constructor(private modalService: NgbModal) { }

  openAddModal(modal: TemplateRef<any>) {
    this.selectedProject = null;
    this.projectForm = {};
    this.modalService.open(modal);
  }

  openEditModal(project: any, modal: TemplateRef<any>) {
    this.selectedProject = project;
    this.projectForm = { ...project };
    this.modalService.open(modal);
  }

  saveProject(modal: any) {
    if (this.selectedProject) {
      Object.assign(this.selectedProject, this.projectForm);
    } else {
      this.projects.push(this.projectForm);
    }
    modal.close();
  }

deleteProject(projectid: string) {
  Swal.fire({
    title: 'هل أنت متأكد؟',
    text: 'لن تتمكن من التراجع عن هذا!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#f6a026 ',
    confirmButtonText: 'حذف',
    cancelButtonText: 'إلغاء'
  }).then((result) => {
    if (result.isConfirmed) {
      this._CRUDProjService.Delete(projectid).subscribe(
        (response) => {
          this.projectss = this.projectss.filter((project) => project.id !== projectid);
          Swal.fire(
            'تم الحذف!',
            'تم حذف المشروع بنجاح.',
            'success'
          );
        },
        (error) => {
          Swal.fire(
            'خطأ!',
            'حدث خطأ أثناء حذف المشروع.',
            'error'
          );
        }
      );
    }
  });
}


  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.projectForm.image = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }
}
