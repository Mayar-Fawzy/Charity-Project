import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

  getProjectsFromService(): Project[] {
    // محاكاة لجلب المشاريع من خدمة
    return [
      {
        id: 1,
        name: 'التعليم للجميع',
        description: 'المساعدة في توفير اللوازم التعليمية والدعم للأطفال المحرومين.',
        imageUrl: 'assets/images/edu.jpg',
        projectStatus: 'Ongoing',
        currentAmount: 360000,
        targetAmount: 900000,
      },
      {
        id: 2,
        name: 'المياه للجميع',
        description: 'مشروع لتوفير المياه النظيفة للمجتمعات المحرومة.',
        imageUrl: 'assets/images/water.jpg',
        projectStatus: 'Ongoing',
        currentAmount: 450000,
        targetAmount: 1000000,
      },
      {
        id: 3,
        name: 'مساعدة الأطفال',
        description: 'مساعدة الأطفال الذين يعيشون في ظروف صعبة.',
        imageUrl: 'assets/images/children.jpg',
        projectStatus: 'Completed',
        currentAmount: 1200000,
        targetAmount: 1200000,
      },
      // أضف المزيد من المشاريع هنا
    ];
  }

  itemsPerPage = 6;
  currentPage = 1;

  get paginatedProjects() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredProjects.slice(start, start + this.itemsPerPage);
  }

  get totalPagesArray() {
    return Array.from({
      length: Math.ceil(this.filteredProjects.length / this.itemsPerPage),
    }).map((_, i) => i + 1);
  }

  goToPage(page: number) {
    this.currentPage = page;
  }

  getProgressPercentage(project: Project): number {
    return Math.round((project.currentAmount / project.targetAmount) * 100);
  }

  goToPayment(projectId: number) {
    console.log('الدفع لمشروع:', projectId);
  }
}
