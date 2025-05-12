import { Component, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbModule],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss'
})
export class ProjectsComponent {

  projects = [
    {
      title: 'المساعدات الغذائية',
      description: 'نظم حملة لتوزيع المساعدات الغذائية للعائلات المحتاجة.',
      progress: 0,
      goal: 600000,
      image: 'assets/food-help.jpg'
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

  deleteProject(project: any) {
    this.projects = this.projects.filter(p => p !== project);
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
