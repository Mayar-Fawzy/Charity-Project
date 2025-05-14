import { Component, inject, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { LoginService } from '../../../../Auth/core/Services/login.service';
import { InkindData } from '../../../../Beneficary/core/Interface/inkind-pages';
import { InkindDonationAdminService } from '../Core/Services/inkind-donation-admin.service';

@Component({
  selector: 'app-pending-items',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgbModule],
  templateUrl: './pending-items.component.html',
  styleUrl: './pending-items.component.scss'
})
export class PendingItemsComponent {
  private readonly _inkind = inject(InkindDonationAdminService);
  private readonly _loginService = inject(LoginService);
  private readonly _modalService = inject(NgbModal);

  private imageIndices = new Map<string, number>();
  products: InkindData[] = [];
  filteredProjects: InkindData[] = [];
  loading = false;
  error: string | null = null;
  searchTerm: string = '';
  itemsPerPage = 3;
  currentPage = 1;
  totalPages = 1;
  totalCount = 0;
  selectedItem: InkindData | null = null;
  isLoading: boolean = false;

  // Reactive form for adding/editing items
  itemForm: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(40)]),
    description: new FormControl('', [Validators.required, Validators.maxLength(500)]),
    itemType: new FormControl(null, [Validators.required]),
    donationStatus: new FormControl(null, [Validators.required]),
    quantity: new FormControl(0, [Validators.required, Validators.min(1)]),
    images: new FormControl<File[] | null>(null)
  });

  ngOnInit(): void {
    this.loadPage();
  }

  onSearch(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredProjects = this.products.filter(project =>
      project.name.toLowerCase().includes(term)
    );
  }

  loadPage(): void {
    this.loading = true;
    this._inkind.GetPaginatedinKindDonations(this.currentPage, this.itemsPerPage).subscribe({
      next: (res) => {
        this.products = res.data || [];
        this.filteredProjects = [...this.products];
        this.totalCount = res.totalCount;
        this.currentPage = res.currentPage;
        this.totalPages = res.totalPages;
        this.loading = false;
        this.onSearch();
      },
      error: (err) => {
        this.error = 'حدث خطأ أثناء جلب البيانات. يرجى المحاولة لاحقًا.';
        this.loading = false;
        Swal.fire({
          icon: 'error',
          title: 'خطأ',
          text: 'حدث خطأ أثناء جلب البيانات',
          confirmButtonColor: '#f6a026',
          confirmButtonText: 'حسنا'
        });
      }
    });
  }

  // Open the modal for editing an item
  openEditModal(item: InkindData, modal: TemplateRef<any>): void {
    this.selectedItem = item;
    this.itemForm.patchValue({
      name: item.name,
      description: item.description,
      itemType: item.itemType,
      donationStatus: item.donationStatus,
      quantity: item.quantity
    });
    this._modalService.open(modal);
  }

  // Handle file input for images
  onImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      this.itemForm.get('images')?.setValue(files);
    }
  }

  // Save the updated item
  saveItem(modal: any): void {
    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const values = this.itemForm.value;
    const formData = new FormData();

    formData.append('id', this.selectedItem!.id);
    formData.append('name', values.name || '');
    formData.append('description', values.description || '');
    formData.append('itemType', values.itemType.toString());
    formData.append('donationStatus', values.donationStatus.toString());
    formData.append('quantity', values.quantity.toString());
    if (values.images) {
      values.images.forEach((file: File) => formData.append('images', file));
    }
    // Preserve existing image URLs if no new images are uploaded
    if (!values.images && this.selectedItem?.imageUrls) {
      this.selectedItem.imageUrls.forEach(url => formData.append('imageUrls', url));
    }
    formData.append('isAllocated', 'false'); // Based on Postman screenshot
    formData.append('donorId', '503cfcf5-40b5-4602-9542-c7a2e510a2d3'); // Static for now, replace with actual donor ID if needed
    formData.append('projectId', ''); // Empty as per Postman screenshot
    formData.append('createdDate', this.selectedItem?.createdDate || new Date().toISOString());

    this._inkind.UpdateInKindDonation(formData).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.isSucceeded) {
          const index = this.products.findIndex(p => p.id === this.selectedItem!.id);
          if (index !== -1) {
            this.products[index] = {
              ...this.products[index],
              name: values.name,
              description: values.description,
              itemType: values.itemType,
              donationStatus: values.donationStatus,
              quantity: values.quantity,
              imageUrls: values.images ? [] : this.products[index].imageUrls // Update image URLs if new images are uploaded
            };
            this.filteredProjects = [...this.products];
          }

          Swal.fire({
            icon: 'success',
            title: 'نجاح',
            text: 'تم تحديث العنصر بنجاح',
            confirmButtonColor: '#f6a026',
            confirmButtonText: 'حسنا'
          });
          modal.close();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'خطأ',
            text: response.message || 'فشل التحديث',
            confirmButtonColor: '#f6a026',
            confirmButtonText: 'حسنا'
          });
        }
      },
      error: (err) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'خطأ',
          text: 'حدث خطأ أثناء تحديث العنصر',
          confirmButtonColor: '#f6a026',
          confirmButtonText: 'حسنا'
        });
      }
    });
  }

  deleteProject(projectId: string): void {
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
        this._inkind.DeleteInKindDonation(projectId).subscribe({
          next: (response) => {
            if (response.isSucceeded) {
              this.products = this.products.filter((project) => project.id !== projectId);
              this.filteredProjects = [...this.products];
              this.totalCount--;
              this.totalPages = Math.ceil(this.totalCount / this.itemsPerPage);

              if (this.products.length === 0 && this.currentPage > 1) {
                this.currentPage--;
              }

              this.loadPage();

              Swal.fire('تم الحذف!', 'تم حذف العنصر بنجاح.', 'success');
            } else {
              Swal.fire('خطأ!', response.message || 'فشل الحذف', 'error');
            }
          },
          error: (error) => {
            Swal.fire('خطأ!', 'حدث خطأ أثناء حذف العنصر.', 'error');
          }
        });
      }
    });
  }

  nextImage(productId: string, imageCount: number): void {
    const currentIndex = this.imageIndices.get(productId) ?? 0;
    const newIndex = (currentIndex + 1) % imageCount;
    this.imageIndices.set(productId, newIndex);
  }

  prevImage(productId: string, imageCount: number): void {
    const currentIndex = this.imageIndices.get(productId) ?? 0;
    const newIndex = (currentIndex - 1 + imageCount) % imageCount;
    this.imageIndices.set(productId, newIndex);
  }

  getCurrentImageIndex(productId: string): number {
    return this.imageIndices.get(productId) ?? 0;
  }

  get paginatedProjects(): InkindData[] {
    return this.filteredProjects;
  }

  get displayedPages(): number[] {
    const pages: number[] = [];
    const total = this.totalPages;

    let start = this.currentPage;
    let end = Math.min(total, this.currentPage + 1);

    if (this.currentPage === total && total > 1) {
      start = this.currentPage - 1;
      end = this.currentPage;
    } else if (this.currentPage === 1 && total === 1) {
      start = 1;
      end = 1;
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadPage();
    }
  }

  goToPrevious(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadPage();
    }
  }

  goToNext(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadPage();
    }
  }
}