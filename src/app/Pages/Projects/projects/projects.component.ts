import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Data } from '../../../Pages/Donor/core/interface/iproject-donate';
import { ProjectPagenationService } from '../Core/Services/project-pagenation.service';
import Swal from 'sweetalert2';
import { ProjectStatusArPipe } from '../Core/Pipe/project-status-ar.pipe';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, FormsModule, ProjectStatusArPipe],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit {
  private readonly projectService = inject(ProjectPagenationService);
  private readonly _Router = inject(Router);
  searchTerm: string = '';
  projects: Data[] = [];
  filteredProjects: Data[] = [];
  progressPercentages: number[] = [20, 50, 75, 30, 60, 90]; // نسب تقدم مختلفة
  itemsPerPage = 6;
  currentPage = 1;
  totalPages = 1;
  totalCount = 0;

  ngOnInit() {
    this.getPaginatedProjectsFromAPI();
  }

  onSearch() {
    const term = this.searchTerm.toLowerCase();
    this.filteredProjects = this.projects.filter(project =>
      project.name.toLowerCase().includes(term)
    );
  }

  getPaginatedProjectsFromAPI() {
    this.projectService.GetPaginatedProjects(this.currentPage, this.itemsPerPage).subscribe({
      next: (response: any) => {
        this.projects = response.data.map((project: Data, index: number) => {
          return {
            ...project,
            progressPercentage: this.progressPercentages[index % this.progressPercentages.length], // تعيين نسبة تقدم ثابتة
          };
        });
        this.filteredProjects = [...this.projects]; // نسخ المشاريع إلى filteredProjects
        this.totalCount = response.totalCount;
        this.currentPage = response.currentPage; // تحديث الصفحة الحالية من الـ API
        this.totalPages = response.totalPages;   // تحديث إجمالي الصفحات من الـ API
        this.onSearch(); // إعادة فلترة حسب البحث
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

  goToPayment(projectId: string) {
    const token = localStorage.getItem('userToken');

    if (!token) {
      Swal.fire({
        icon: 'warning',
        title: "خطأ",
        text: "يجب عليك التسجيل أولًا قبل التبرع",
        confirmButtonColor: "#f6a026",
        confirmButtonText: "حسنا",
      });
    } else {
      this._Router.navigate(['/ewallet-payment', projectId]);
    }
  }

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
  
}