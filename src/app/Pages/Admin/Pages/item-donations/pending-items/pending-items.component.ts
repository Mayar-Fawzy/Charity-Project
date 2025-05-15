import { error } from 'console';
import { Component, inject, TemplateRef, ChangeDetectorRef } from '@angular/core'; // Add ChangeDetectorRef
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
  private readonly _cdr = inject(ChangeDetectorRef); // Inject ChangeDetectorRef

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
  errorMessage!:string
  selectedItem: InkindData | null = null;
  isLoading: boolean = false;

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
    this._cdr.detectChanges(); //  updates after search
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
        this._cdr.detectChanges(); //updates after loading
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
        this._cdr.detectChanges();
      }
    });
  }

openEditModal(item: InkindData | null, modal: TemplateRef<any>): void {
    this.selectedItem = item;
    if (item) {
        this.itemForm.patchValue({
            name: item.name,
            description: item.description,
            itemType: item.itemType,
            donationStatus: item.donationStatus,
            quantity: item.quantity,
            images: null 
        });
    } else {
        this.itemForm.reset(); 
    }
    this._modalService.open(modal);
}

onImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
        const files = Array.from(input.files);
        this.itemForm.get('images')?.setValue(files);
    }
}

saveItem(modal: any): void {
    if (this.itemForm.invalid) {
        this.itemForm.markAllAsTouched();
        return;
    }

    this.isLoading = true;
    const values = this.itemForm.value;
    const formData = new FormData();

    formData.append('name', values.name || '');
    formData.append('description', values.description || '');
    formData.append('itemType', values.itemType.toString());
    formData.append('donationStatus', values.donationStatus.toString());
    formData.append('quantity', values.quantity.toString());
    if (values.images) {
        values.images.forEach((file: File) => formData.append('images', file));
    }
    formData.append('isAllocated', 'false');
    formData.append('donorId', this._loginService.donorId || '');
    formData.append('projectId', '');
    formData.append('createdDate', this.selectedItem?.createdDate || new Date().toISOString());

    if (this.selectedItem) {
        // Update Item
        formData.append('id', this.selectedItem.id);
        if (!values.images && this.selectedItem?.imageUrls) {
            this.selectedItem.imageUrls.forEach(url => formData.append('imageUrls', url));
        }

        this._inkind.UpdateInKindDonation(formData).subscribe({
            next: (response) => {
                this.isLoading = false;
                if (response.isSucceeded) {
                    const index = this.products.findIndex(p => p.id === this.selectedItem!.id);
                    if (index !== -1) {
                        // Update the item in the products array with all fields
                        const updatedItem: InkindData = {
                            ...this.products[index],
                            name: values.name,
                            description: values.description,
                            itemType: values.itemType,
                            donationStatus: values.donationStatus,
                            quantity: values.quantity,
                            imageUrls: response.data?.imageUrls || this.products[index].imageUrls, 
                            donorId: this._loginService.donorId || this.products[index].donorId,
                            projectId: this.products[index].projectId || '',
                            createdDate: this.products[index].createdDate || new Date().toISOString(),
                            isAllocated: false
                        };
                        this.products = [
                            ...this.products.slice(0, index),
                            updatedItem,
                            ...this.products.slice(index + 1)
                        ];
                        // Update filteredProjects and re-apply search
                        this.filteredProjects = [...this.products];
                        this.onSearch();
                    }

                    Swal.fire({
                        icon: 'success',
                        title: 'نجاح',
                        text: 'تم تحديث العنصر بنجاح',
                        confirmButtonColor: '#f6a026',
                        confirmButtonText: 'حسنا'
                    });

                    modal.close();
                    this.loadPage();
                    this._cdr.detectChanges(); // Force change detection
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'خطأ',
                        text: response.errors || 'فشل التحديث',
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
                    text: err.errors || 'Each file must be 2MB or smaller.',
                    confirmButtonColor: '#f6a026',
                    confirmButtonText: 'حسنا'
                });
                this._cdr.detectChanges();
                console.error(err);
            }
        });
    } 
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
                this.loadPage(); 
              } else {
                this.onSearch(); 
                this._cdr.detectChanges(); 
              }

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
    this._cdr.detectChanges(); 
  }

  prevImage(productId: string, imageCount: number): void {
    const currentIndex = this.imageIndices.get(productId) ?? 0;
    const newIndex = (currentIndex - 1 + imageCount) % imageCount;
    this.imageIndices.set(productId, newIndex);
    this._cdr.detectChanges(); 
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