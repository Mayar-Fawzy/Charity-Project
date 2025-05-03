import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Data } from '../../../Pages/Donor/core/interface/iproject-donate';
import { ProjectPagenationService } from '../Core/Services/project-pagenation.service';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit {

  searchTerm: string = '';
  projects: Data[] = [];
  filteredProjects: Data[] = [];

  itemsPerPage = 6;
  currentPage = 1;
  totalCount = 0;

  constructor(
    private router: Router,
    private projectService: ProjectPagenationService
  ) {}

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
        this.projects = response.data;
        this.totalCount = response.totalCount;
        this.onSearch(); // إعادة فلترة حسب البحث
      },
      error: (err) => {
        console.error('حدث خطأ أثناء جلب المشاريع:', err);
      }
    });
  }

  getProgressPercentage(project: any): number {
    const fakeCurrentAmount = project.targetAmount * 0.4;
    return Math.round((fakeCurrentAmount / project.targetAmount) * 100);
  }


  goToPayment(projectId: string) {
    this.router.navigate(['/ewallet-payment', projectId]);
  }

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.itemsPerPage);
  }

  // لم نعد نستخدم slice لأن البيانات جاهزة من الـ API للصفحة الحالية
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
    if (this.currentPage > 1) {
      this.currentPage--;
      this.getPaginatedProjectsFromAPI();
    }
  }

  goToNext() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.getPaginatedProjectsFromAPI();
    }
  }
}
