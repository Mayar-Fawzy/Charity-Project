import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { Table } from 'primeng/table';
import Swal from 'sweetalert2';
import { InkindDonationAdminService } from '../item-donations/Core/Services/inkind-donation-admin.service';

interface DonationRequest {
  donationId: string;
  name: string;
  quantity: number;
}

interface RequestItem {
  beneficiaryId: string;
  beneficiaryName: string;
  email: string;
  status: 'قيد المراجعة' | 'مقبول' | 'مرفوض';
}

interface Volunteer {
  id: string;
  name: string;
}

@Component({
  selector: 'app-aid-distribution',
  standalone: true,
  imports: [ CommonModule, TableModule, ButtonModule, CardModule, InputTextModule, DropdownModule, FormsModule ],
  templateUrl: './aid-distribution.component.html',
  styleUrl: './aid-distribution.component.scss'
})
export class AidDistributionComponent implements OnInit {
  @ViewChild('dt') dt!: Table;

  donationRequests: DonationRequest[] = [];
  selectedItem: DonationRequest | null = null;
  selectedItemRequests: RequestItem[] = [];
  selectedRequests: RequestItem[] = [];
  selectedVolunteerId: string = '';
  isDistributing = false;

  volunteers: Volunteer[] = [
    { id: 'v1', name: 'أحمد محمد' },
    { id: 'v2', name: 'سارة علي' }
  ];

  constructor(private inKindService: InkindDonationAdminService) { }

  ngOnInit(): void {
    this.fetchInKindDonations();
  }

  fetchInKindDonations(): void {
    this.inKindService.GetAllInKindDonations().subscribe({
      next: (res) => {
        const data = res.data ?? [];
        this.donationRequests = data
          .filter((item: any) => !item.projectId)
          .map((item: any) => ({
            donationId: item.id,
            name: item.name,
            quantity: item.quantity
          }));
      },
      error: (err) => {
        console.error('حدث خطأ أثناء جلب التبرعات العينية', err);
      }
    });
  }

  onGlobalFilter(event: Event) {
    const input = event.target as HTMLInputElement;
    this.dt.filterGlobal(input.value, 'contains');
  }

  viewRequestsForItem(donation: DonationRequest) {
    this.selectedItem = donation;
    this.selectedRequests = [];

    this.selectedItemRequests = [
      {
        beneficiaryId: 'b1',
        beneficiaryName: 'محمد حسن',
        email: 'mohamed@example.com',
        status: 'قيد المراجعة'
      },
      {
        beneficiaryId: 'b2',
        beneficiaryName: 'خالد سالم',
        email: 'khaled@example.com',
        status: 'قيد المراجعة'
      }
    ];
  }

  async confirmDistribution() {
    if (!this.selectedItem) return;

    if (!this.selectedVolunteerId || this.selectedRequests.length === 0) {
      await Swal.fire({
        icon: 'warning',
        title: 'مطلوب بيانات',
        text: 'يرجى اختيار متطوع واختيار مستفيد واحد على الأقل.',
      });
      return;
    }

    if (this.selectedRequests.length > this.selectedItem.quantity) {
      await Swal.fire({
        icon: 'error',
        title: 'عدد المستفيدين أكبر من الكمية',
        text: 'يرجى تقليل عدد الاختيارات.',
      });
      return;
    }

    const result = await Swal.fire({
      icon: 'question',
      title: 'تأكيد التوزيع',
      text: 'هل أنت متأكد من توزيع المساعدات على المستفيدين المحددين؟',
      showCancelButton: true,
      confirmButtonText: 'نعم، قم بالتوزيع',
      cancelButtonText: 'إلغاء'
    });

    if (!result.isConfirmed) return;

    this.isDistributing = true;

    try {
      this.selectedRequests.forEach(request => {
        request.status = 'مقبول';
      });

      this.selectedItemRequests.forEach(request => {
        if (!this.selectedRequests.includes(request)) {
          request.status = 'مرفوض';
        }
      });

      await Swal.fire({
        icon: 'success',
        title: 'تم التوزيع بنجاح',
        text: 'تم تحديث حالة الطلبات المختارة.',
      });

      this.selectedRequests = [];
    } finally {
      this.isDistributing = false;
    }
  }
}
