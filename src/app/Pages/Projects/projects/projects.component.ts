import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface Project {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  projectStatus: string;
  currentAmount: number;
  targetAmount: number;
}

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent {
  
  // >>>>>>>>>>>>>>>>>> Search
  searchTerm: string = '';
  projects: Project[] = [];
  filteredProjects: Project[] = [];

  ngOnInit() {
    this.projects = this.getProjectsFromService();
    this.filteredProjects = [...this.projects];
  }

  onSearch() {
    const term = this.searchTerm.toLowerCase();
    this.filteredProjects = this.projects.filter(project =>
      project.name.toLowerCase().includes(term)
    );
  }


  // >>>>>>>>>>>>>>. Projects 
  getProjectsFromService(): Project[] {
    return [
      {
        id: 1,
        name: 'التعليم للجميع',
        description: 'المساعدة في توفير اللوازم التعليمية والدعم للأطفال المحرومين.',
        imageUrl: '/Images/project-1.png',
        projectStatus: 'Ongoing',
        currentAmount: 360000,
        targetAmount: 900000,
      },
      {
        id: 2,
        name: 'المياه للجميع',
        description: 'مشروع لتوفير المياه النظيفة للمجتمعات المحرومة.',
        imageUrl: '/Images/project-2.png',
        projectStatus: 'Ongoing',
        currentAmount: 450000,
        targetAmount: 1000000,
      },
      {
        id: 3,
        name: 'مساعدة الأطفال',
        description: 'مساعدة الأطفال الذين يعيشون في ظروف صعبة.',
        imageUrl: '/Images/project-3.png',
        projectStatus: 'Completed',
        currentAmount: 1200000,
        targetAmount: 1200000,
      },
      {
        id: 4,
        name: 'التعليم للجميع',
        description: 'المساعدة في توفير اللوازم التعليمية والدعم للأطفال المحرومين.',
        imageUrl: '/Images/project-1.png',
        projectStatus: 'Ongoing',
        currentAmount: 360000,
        targetAmount: 900000,
      },
      {
        id: 5,
        name: 'المياه للجميع',
        description: 'مشروع لتوفير المياه النظيفة للمجتمعات المحرومة.',
        imageUrl: '/Images/project-2.png',
        projectStatus: 'Ongoing',
        currentAmount: 450000,
        targetAmount: 1000000,
      },

    ];
  }

  // >>>>>>>>>>>>>>>>>>>>> Calc percentage 
  getProgressPercentage(project: Project): number {
    return Math.round((project.currentAmount / project.targetAmount) * 100);
  }



  // >>>>>>>>>>>>>>>> go to Payment 
  constructor(private router: Router) { }
  goToPayment(projectId: number) {
    this.router.navigate(['/ewallet-payment', projectId]);
  }

  // >>>>>>>>>>>> Pagination 

  itemsPerPage = 6;
  currentPage = 1;

  get totalPages(): number {
    return Math.ceil(this.filteredProjects.length / this.itemsPerPage);
  }

  get paginatedProjects() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredProjects.slice(start, start + this.itemsPerPage);
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
    }
  }

  goToPrevious() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  goToNext() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }
}
