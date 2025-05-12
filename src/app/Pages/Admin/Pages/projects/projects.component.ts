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
  styleUrl: './projects.component.scss'
})
export class ProjectsComponent {
  private readonly _CRUDProjService = inject(CRUDProjService);
  private readonly _Router = inject(Router);
  private readonly modalService = inject(NgbModal);
  private readonly _LoginService = inject(LoginService);
private readonly cdr = inject(ChangeDetectorRef);
  userData: any = null;
  isloading: boolean = false;
  projectss: GetProjj[] = [];
  filteredProjects: GetProjj[] = [];
  progressPercentages: number[] = [20, 50, 75, 30, 60, 90];
  itemsPerPage = 3;
  currentPage = 1;
  totalPages = 1;
  totalCount = 0;
  selectedProject: GetProjj | null = null;

  AddedProj: FormGroup = new FormGroup({
    name: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(40),
    ]),
    image: new FormControl<File | null>(null),
    targetAmount: new FormControl(0, [Validators.required, Validators.min(1)]),
    description: new FormControl('', [Validators.required, Validators.maxLength(500)]),
    startDate: new FormControl('', [Validators.required]),
    endDate: new FormControl('', [Validators.required]),
    managerId: new FormControl(''),
  });

  ngOnInit() {
    this.userData = this._LoginService.saveUserAuth();
    if (this.userData) {
      this.AddedProj.get('managerId')?.setValue(this.userData["http://schemas.microsoft.com/ws/2008/06/identity/claims/primarysid"]);
    } else {
      console.error('لم يتم جلب بيانات المستخدم.');
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "لم يتم جلب بيانات المستخدم. يرجى تسجيل الدخول مرة أخرى.",
        confirmButtonColor: "#f6a026",
        confirmButtonText: "حسنا",
      });
      this._Router.navigate(['/login']);
      return;
    }
    this.getPaginatedProjectsFromAPI();
  }

  getPaginatedProjectsFromAPI() {
    this.isloading = true;
    this._CRUDProjService.GetPaginatedProjects(this.currentPage, this.itemsPerPage).subscribe({
      next: (response: IGetProj) => {
        this.projectss = response.data.map((project: GetProjj, index: number) => ({
          ...project,
          progressPercentage: this.progressPercentages[index % this.progressPercentages.length],
        }));
        this.filteredProjects = [...this.projectss];
        this.totalCount = response.totalCount;
        this.currentPage = response.currentPage;
        this.totalPages = response.totalPages;
        this.isloading = false;
        console.log(this.projectss);
      },
      error: (err) => {
        this.isloading = false;
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
    return project.progressPercentage || 0;
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

  openAddModal(modal: TemplateRef<any>) {
    this.selectedProject = null;
    this.AddedProj.reset();
    if (this.userData) {
      this.AddedProj.get('managerId')?.setValue(this.userData["http://schemas.microsoft.com/ws/2008/06/identity/claims/primarysid"]);
    }
    this.modalService.open(modal);
  }

  openEditModal(project: GetProjj, modal: TemplateRef<any>) {
    this.selectedProject = project;
    this.AddedProj.patchValue({
      name: project.name,
      targetAmount: project.targetAmount,
      description: project.description,
      startDate: project.startDate.split('T')[0],
      endDate: project.endDate.split('T')[0],
      managerId: this.userData ? this.userData["http://schemas.microsoft.com/ws/2008/06/identity/claims/primarysid"] : '',
    });
    this.modalService.open(modal);
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.AddedProj.get('image')?.setValue(file);
    }
  }
saveProject(modal: any) {
  if (this.AddedProj.invalid) {
    this.AddedProj.markAllAsTouched();
    return;
  }

  this.isloading = true;
  const formData = new FormData();
  const values = this.AddedProj.value;

  formData.set('name', values.name || '');
  formData.set('targetAmount', values.targetAmount?.toString() || '0');
  formData.set('description', values.description || '');
  formData.set('startDate', values.startDate || new Date().toISOString().split('T')[0]);
  formData.set('endDate', values.endDate || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]);
  formData.set('managerId', this.userData ? this.userData["http://schemas.microsoft.com/ws/2008/06/identity/claims/primarysid"] : '');
  if (values.image) {
    formData.set('image', values.image);
  }

  if (this.selectedProject) {
    // Update Project
    formData.set('id', this.selectedProject.id);
    formData.set('imageUrl', this.selectedProject.imageUrl || '');
    formData.set('projectStatus', this.selectedProject.projectStatus || 'Ongoing');
    formData.set('createdDate', this.selectedProject.createdDate || new Date().toISOString());

    this._CRUDProjService.UpdateProject(this.selectedProject.id, formData).subscribe({
      next: (response) => {
        this.isloading = false;
        if (response.isSucceeded) {
          this.getPaginatedProjectsFromAPI();
          Swal.fire('نجاح', 'تم تحديث المشروع بنجاح', 'success');
          modal.close();
        } else {
          Swal.fire('خطأ', response.message || 'فشل التحديث', 'error');
        }
      },
      error: (err) => {
        this.isloading = false;
        Swal.fire('خطأ', 'حدث خطأ أثناء التحديث', 'error');
        console.error(err);
      }
    });
  } else {
    // Create Project
    this._CRUDProjService.CreateProject(formData).subscribe({
      next: (response) => {
        this.isloading = false;
        console.log('API Response:', response); // Debug: Log the response to check structure

        if (response.isSucceeded) {
          // Handle case where response.data might be undefined or structured differently
          const newProjectData = response.data || {};

          // Create the new project object based on the API response
          const newProject: GetProjj = {
            id: newProjectData.id || '', // Ensure ID exists
            name: newProjectData.name || values.name,
            managerId: this.userData ? this.userData["http://schemas.microsoft.com/ws/2008/06/identity/claims/primarysid"] : '',
            targetAmount: newProjectData.targetAmount || values.targetAmount,
            description: newProjectData.description || values.description,
            startDate: newProjectData.startDate || values.startDate,
            endDate: newProjectData.endDate || values.endDate,
            imageUrl: newProjectData.imageUrl || '',
            projectStatus: newProjectData.projectStatus || 'Ongoing',
            createdDate: newProjectData.createdDate || new Date().toISOString(),
            modifiedDate:newProjectData.modifiedDate ||  new Date().toISOString()
          };

          // Add the new project to the beginning of the projectss array
          this.projectss.unshift(newProject);
          this.filteredProjects = [...this.projectss];
          this.cdr.detectChanges(); // Force change detection to update UI

          // Update total count and total pages
          this.totalCount++;
          this.totalPages = Math.ceil(this.totalCount / this.itemsPerPage);

          // Reset to the first page to show the new project
          this.currentPage = 1;

          // Show success message and close the modal
          Swal.fire({
            icon: 'success',
            title: 'نجاح',
            text: 'تم إضافة المشروع بنجاح',
            confirmButtonColor: '#f6a026',
            confirmButtonText: 'حسناً',
          }).then(() => {
            modal.close();
            // Re-fetch the project list after a slight delay to ensure server consistency
            setTimeout(() => {
              this.getPaginatedProjectsFromAPI();
            }, 500);
          });
        } else {
          Swal.fire('خطأ', response.message || 'فشل الإضافة', 'error');
        }
      },
      error: (err) => {
        this.isloading = false;
        Swal.fire('خطأ', err.message || 'حدث خطأ أثناء الإضافة', 'error');
        console.error(err);
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
        this.isloading = true;
        this._CRUDProjService.Delete(projectId).subscribe(
          (response) => {
            this.isloading = false;
            if (response.isSucceeded) {
              // Remove the deleted project from the projectss array
              this.projectss = this.projectss.filter((project) => project.id !== projectId);
              this.filteredProjects = [...this.projectss];
              this.totalCount--;
              this.totalPages = Math.ceil(this.totalCount / this.itemsPerPage);

              // Adjust the current page if necessary
              if (this.projectss.length === 0 && this.currentPage > 1) {
                this.currentPage--;
              }

              // Re-fetch the projects to ensure consistency with the server
              this.getPaginatedProjectsFromAPI();

              Swal.fire('تم الحذف!', 'تم حذف المشروع بنجاح.', 'success');
            } else {
              Swal.fire('خطأ!', response.message || 'فشل الحذف', 'error');
            }
          },
          (error) => {
            this.isloading = false;
            Swal.fire('خطأ!', 'حدث خطأ أثناء حذف المشروع.', 'error');
            console.error(error);
          }
        );
      }
    });
  }
}