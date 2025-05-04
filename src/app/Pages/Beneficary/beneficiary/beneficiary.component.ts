import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InkinddonationService } from '../core/Services/inkinddonation.service';
import Swal from 'sweetalert2';
import { InkindData } from '../core/Interface/inkind-pages';


@Component({
  selector: 'app-beneficiary',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './beneficiary.component.html',
  styleUrls: ['./beneficiary.component.scss']
})
export class BeneficiaryComponent implements OnInit {
  private readonly _inkind = inject(InkinddonationService);

  // Map to track the current image index for each product
  private imageIndices = new Map<string, number>();
  products: InkindData[] = [];
  filteredProjects: InkindData[] = [];
  loading = false;
  error: string | null = null;
  searchTerm: string = '';
  itemsPerPage = 6;
  currentPage = 1;
  totalPages = 1;
  totalCount = 0;

  ngOnInit(): void {
    this.loadPage();
  }
  
  onSearch(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredProjects = this.products.filter(project =>
      project.name.toLowerCase().includes(term)
    );
    console.log('Filtered Projects:', this.filteredProjects);
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
        console.log('Products:', this.products);
        console.log('Pagination Info:', { currentPage: this.currentPage, totalPages: this.totalPages });
      },
      error: (err) => {
        this.error = 'حدث خطأ أثناء جلب البيانات. يرجى المحاولة لاحقًا.';
        this.loading = false;
        Swal.fire({
          icon: 'error',
          title: 'خطأ',
          text: 'حدث خطأ أثناء جلب البيانات',
          confirmButtonColor: '#f6a026',
          confirmButtonText: 'حسنا',
        });
        console.error('Error fetching donations:', err);
      }
    });
  }

 nextImage(productId: string, imageCount: number): void {
    const currentIndex = this.imageIndices.get(productId) || 0;
    const newIndex = (currentIndex + 1) % imageCount;
    this.imageIndices.set(productId, newIndex);
  }

 // Navigate to the previous image for a specific product
 prevImage(productId: string, imageCount: number): void {
  const currentIndex = this.imageIndices.get(productId) || 0;
  const newIndex = (currentIndex - 1 + imageCount) % imageCount;
  this.imageIndices.set(productId, newIndex);
}

// Get the current image index for a product
getCurrentImageIndex(productId: string): number {
  return this.imageIndices.get(productId) || 0;
}

animateRequest(event: Event) {
  const btn = event.target as HTMLElement | null;
  if (btn) {
    btn.classList.add('animate');
    setTimeout(() => btn.classList.remove('animate'), 500);
  }
}

  get paginatedProjects() {
    return this.filteredProjects;
  }

  get displayedPages(): number[] {
    const pages: number[] = [];
  const total = this.totalPages;

  // نبدأ من الصفحة الحالية
  let start = this.currentPage;
  // النهاية هتبقى الصفحة الحالية + 1 (يعني 2 أرقام بس)
  let end = Math.min(total, this.currentPage + 1);

  // لو الصفحة الحالية هي آخر صفحة، هنظهر الصفحة اللي قبلها والصفحة الحالية
  if (this.currentPage === total && total > 1) {
    start = this.currentPage - 1;
    end = this.currentPage;
  }
  // لو الصفحة الحالية هي 1 وفيه صفحة واحدة بس، هنظهر الصفحة 1 بس
  else if (this.currentPage === 1 && total === 1) {
    start = 1;
    end = 1;
  }

  // نملّي المصفوفة بالأرقام من start لـ end
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
  }

  // get showLeftDots(): boolean {
  //   return this.displayedPages[0] > 1;
  // }

  // get showRightDots(): boolean {
  //   return this.displayedPages[this.displayedPages.length - 1] < this.totalPages;
  // }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadPage();
    }
  }

  goToPrevious() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadPage();
    }
  }

  goToNext() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadPage();
    }
  }
}