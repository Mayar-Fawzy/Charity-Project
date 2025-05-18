import { ChangeDetectorRef, Component, inject, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { GetProjj, IGetProj } from './Core/InterFace/iget-proj';
import Swal from 'sweetalert2';
import { CRUDProjService } from './Core/Services/crudproj.service';
import { Router } from '@angular/router';
import { LoginService } from '../../../Auth/core/Services/login.service';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgbModule],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent {
  private readonly crudProjService = inject(CRUDProjService);
  private readonly router = inject(Router);
  private readonly modalService = inject(NgbModal);
  private readonly loginService = inject(LoginService);
  private readonly cdr = inject(ChangeDetectorRef);

  userData: any = null;
  isLoading: boolean = false;
  projects: GetProjj[] = [];
  filteredProjects: GetProjj[] = [];
  itemsPerPage = 3;
  currentPage = 1;
  totalPages = 1;
  progressPercentages: number[] = [20, 50, 75, 30, 60, 90];
  totalCount = 0;
  selectedProject: GetProjj | null = null;

  projectForm: FormGroup = new FormGroup({
    name: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(40)
    ]),
    image: new FormControl(null, [Validators.required]),
    targetAmount: new FormControl(0, [Validators.required, Validators.min(1)]),
    projectStatus: new FormControl(null), // No validators for add
    description: new FormControl('', [Validators.required, Validators.maxLength(500)]),
    startDate: new FormControl('', [Validators.required]),
    endDate: new FormControl('', [Validators.required]),
    managerId: new FormControl('')
  });

  ngOnInit() {
    this.userData = this.loginService.saveUserAuth();
    if (this.userData) {
      this.projectForm.get('managerId')?.setValue(this.userData["http://schemas.microsoft.com/ws/2008/06/identity/claims/primarysid"]);
      this.getPaginatedProjects();
    } else {
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "لم يتم جلب بيانات المستخدم. يرجى تسجيل الدخول مرة أخرى.",
        confirmButtonColor: "#f6a026",
        confirmButtonText: "حسنا"
      }).then(() => {
        this.router.navigate(['/login']);
      });
    }
  }

  getPaginatedProjects() {
    this.isLoading = true;
    this.crudProjService.GetPaginatedProjects(this.currentPage, this.itemsPerPage).subscribe({
      next: (response: IGetProj) => {
        this.projects = response.data.map((project: GetProjj, index: number) => {
          const status = Number(project.projectStatus);
          return {
            ...project,
            projectStatus: status,
            progressPercentage: this.progressPercentages[index % this.progressPercentages.length]
          };
        });
        this.filteredProjects = [...this.projects];
        this.totalCount = response.totalCount;
        this.currentPage = response.currentPage;
        this.totalPages = response.totalPages;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        Swal.fire({
          icon: "error",
          title: "خطأ",
          text: "حدث خطأ أثناء جلب المشاريع",
          confirmButtonColor: "#f6a026",
          confirmButtonText: "حسنا"
        });
        console.error('Error fetching projects:', err);
      }
    });
  }

  getProgressPercentage(project: any): number {
    return project.progressPercentage || 0;
  }

  get paginatedProjects() {
    return this.filteredProjects;
  }

  get displayedPages(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    const half = Math.floor(maxPagesToShow / 2);
    let start = Math.max(1, this.currentPage - half);
    let end = Math.min(this.totalPages, this.currentPage + half);

    if (this.currentPage <= half) {
      end = Math.min(this.totalPages, maxPagesToShow);
    } else if (this.currentPage + half > this.totalPages) {
      start = Math.max(1, this.totalPages - maxPagesToShow + 1);
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
      this.getPaginatedProjects();
    }
  }

  goToPrevious() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.getPaginatedProjects();
    }
  }

  goToNext() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.getPaginatedProjects();
    }
  }

  openAddModal(modal: TemplateRef<any>) {
    this.selectedProject = null;
    this.projectForm.reset({
      managerId: this.userData?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/primarysid"] || ''
    });
    this.projectForm.get('image')?.setValidators([Validators.required]);
    this.projectForm.get('projectStatus')?.clearValidators();
    this.projectForm.get('image')?.updateValueAndValidity();
    this.projectForm.get('projectStatus')?.updateValueAndValidity();
    this.modalService.open(modal);
  }

  openEditModal(project: GetProjj, modal: TemplateRef<any>) {
    this.selectedProject = project;
    this.projectForm.patchValue({
      name: project.name,
      targetAmount: project.targetAmount,
      description: project.description,
      projectStatus: project.projectStatus,
      startDate: project.startDate.split('T')[0],
      endDate: project.endDate.split('T')[0],
      managerId: this.userData?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/primarysid"] || ''
    });
    this.projectForm.get('image')?.clearValidators();
    this.projectForm.get('projectStatus')?.setValidators([Validators.required]);
    this.projectForm.get('image')?.updateValueAndValidity();
    this.projectForm.get('projectStatus')?.updateValueAndValidity();
    this.modalService.open(modal);
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.projectForm.get('image')?.setValue(input.files[0]);
    }
  }

  saveProject(modal: any) {
    if (this.projectForm.invalid) {
      this.projectForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const formData = new FormData();
    const values = this.projectForm.value;

    formData.append('name', values.name || '');
    formData.append('targetAmount', values.targetAmount?.toString() || '0');
    formData.append('description', values.description || '');
    formData.append('startDate', values.startDate || '');
    formData.append('endDate', values.endDate || '');
    formData.append('managerId', values.managerId || '');

    if (values.image) {
      formData.append('image', values.image);
    }

    if (this.selectedProject) {
      // Include projectStatus only when editing
      formData.append('projectStatus', Number(values.projectStatus).toString());
      formData.append('id', this.selectedProject.id);
      formData.append('imageUrl', this.selectedProject.imageUrl || '');
      formData.append('createdDate', this.selectedProject.createdDate || new Date().toISOString());

      this.crudProjService.UpdateProject(this.selectedProject.id, formData).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.isSucceeded) {
            Swal.fire('نجاح', 'تم تحديث المشروع بنجاح', 'success');
            modal.close();
            this.getPaginatedProjects();
          } else {
            Swal.fire('خطأ', response.errors || 'فشل التحديث', 'error');
          }
        },
        error: (err) => {
          this.isLoading = false;
          Swal.fire('خطأ', err.error?.errors || 'حدث خطأ أثناء التحديث', 'error');
        }
      });
    } else {
      this.crudProjService.CreateProject(formData).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.isSucceeded) {
            this.currentPage = 1; // Go to the first page to show the new project
            Swal.fire({
              icon: 'success',
              title: 'نجاح',
              text: 'تم إضافة المشروع بنجاح',
              confirmButtonColor: '#f6a026',
              confirmButtonText: 'حسناً'
            }).then(() => {
              modal.close();
              this.getPaginatedProjects();
            });
          } else {
            Swal.fire('خطأ', response.errors || 'فشل الإضافة', 'error');
          }
        },
        error: (err) => {
          this.isLoading = false;
          Swal.fire('خطأ', err.error?.errors || 'حدث خطأ أثناء الإضافة', 'error');
        }
      });
    }
  }

  deleteProject(projectId: string) {
    Swal.fire({
      title: 'هل أنت متأكد؟',
      text: 'لن تتمكن من التراجع عن هذا!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#f6a026',
      confirmButtonText: 'حذف',
      cancelButtonText: 'إلغاء'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.crudProjService.Delete(projectId).subscribe({
          next: (response) => {
            this.isLoading = false;
            if (response.isSucceeded) {
              if (this.projects.length === 1 && this.currentPage > 1) {
                this.currentPage--;
              }
              Swal.fire('تم الحذف!', 'تم حذف المشروع بنجاح.', 'success');
              this.getPaginatedProjects();
            } else {
              Swal.fire('خطأ!', response.errors || 'فشل الحذف', 'error');
            }
          },
          error: (err) => {
            this.isLoading = false;
            Swal.fire('خطأ!', err.error?.errors || 'حدث خطأ أثناء الحذف', 'error');
          }
        });
      }
    });
  }
}