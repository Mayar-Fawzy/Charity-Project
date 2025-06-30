import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';
import { AidDistributionService } from '../aid-distribution/Core/Service/aid-distribution.service';
import { Environment } from '../../../Auth/core/Environment/Environment';
import { AidDistribution, DistributionDisplay } from './Core/Interface/iassistance-aid-distribution';


@Component({
  selector: 'app-aid-distribution-list',
  standalone: true,
  imports: [CommonModule, TableModule, CardModule],
  templateUrl: './aid-distribution.component.html',
  styleUrl: './aid-distribution.component.scss',
})
export class AidDistributionListComponent implements OnInit {
  distributions: DistributionDisplay[] = [];
  isLoading = false;

  constructor(private aidDistributionService: AidDistributionService, private http: HttpClient) { }


  volunteers: any[] = [];

  ngOnInit(): void {
    this.fetchDistributions();
    this.loadVolunteersForActivity('f972d6c2-8538-48ac-9540-a3856b1699f2');
  }

  loadVolunteersForActivity(activityId: string): void {
    this.http.get<any>('https://givinghandcharity.runasp.net/api/v1/VolunteerApplication/GetAllVolunteerApplications')
      .subscribe((res: any) => {
        const applications = res?.data || [];

        const acceptedVolunteers = applications.filter((app: any) =>
          app.volunteerActivityId === activityId && app.requestStatus === 1
        );

        const requests = acceptedVolunteers.map((app: any) =>
          this.http.get<any>(`https://givinghandcharity.runasp.net/api/v1/User/GetUserById?id=${app.volunteerId}`)
        );

        Promise.all(requests.map((req: any) => req.toPromise()))

          .then((users: any[]) => {
            this.volunteers = users.map((res: any) => res.data);
            console.log('المتطوعين:', this.volunteers);
          })
          .catch(err => console.error('خطأ في تحميل المتطوعين', err));
      });
  }

  fetchDistributions(): void {
    this.isLoading = true;

    this.aidDistributionService.getAllAidDistributions().subscribe({
      next: (res: any) => {
        const data: AidDistribution[] = res.data || [];

        const userIds = new Set<string>();
        const donationIds = new Set<string>();

        data.forEach(d => {
          if (d.beneficiaryId) userIds.add(d.beneficiaryId);
          if (d.volunteerId) userIds.add(d.volunteerId);
          if (d.inKindDonationId) donationIds.add(d.inKindDonationId);
        });

        const userRequests = Array.from(userIds).map(id =>
          this.http.get<any>(`${Environment.baseUrl}${Environment.VersionUrl}User/GetUserById?id=${id}`)
        );

        const donationRequests = Array.from(donationIds).map(id =>
          this.http.get<any>(`${Environment.baseUrl}${Environment.VersionUrl}InKindDonation/GetInKindDonationById?id=${id}`)
        );

        forkJoin([
          forkJoin(userRequests),
          forkJoin(donationRequests)
        ]).subscribe({
          next: ([users, donations]) => {
            const userMap = new Map<string, string>();
            const donationMap = new Map<string, string>();

            users.forEach(u => {
              if (u?.data) {
                const fullName = `${u.data.firstName} ${u.data.lastName}`.trim();
                userMap.set(u.data.id, fullName);
              }
            });

            donations.forEach(d => {
              if (d?.data) donationMap.set(d.data.id, d.data.name);
            });

            this.distributions = data.map(d => ({
              id: d.id,
              beneficiaryId: d.beneficiaryId,
              inKindDonationId: d.inKindDonationId,
              monetaryDonationId: d.monetaryDonationId,
              volunteerId: d.volunteerId,
              amount: d.amount,
              status: d.status,
              donationName: d.inKindDonationId
                ? donationMap.get(d.inKindDonationId) || 'تبرع عيني'
                : 'تبرع مالي',
              beneficiaryName: userMap.get(d.beneficiaryId) || 'غير معروف',
              volunteerName: userMap.get(d.volunteerId) || 'غير معروف',
              quantity: d.quantity,
              description: d.description || 'لا يوجد وصف'
            }));

            this.isLoading = false;
          },
          error: () => {
            console.error('خطأ في تحميل بيانات المستخدمين أو التبرعات');
            this.isLoading = false;
          }
        });
      },
      error: (err: any) => {
        console.error('خطأ في جلب التوزيعات', err);
        this.isLoading = false;
      }
    });
  }

  deleteDistribution(dist: any): void {
    Swal.fire({
      title: 'هل أنت متأكد؟',
      text: 'سيتم حذف التوزيع نهائياً!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'نعم، احذف',
      cancelButtonText: 'إلغاء'
    }).then(result => {
      if (result.isConfirmed) {
        this.http.delete(`${Environment.baseUrl}${Environment.VersionUrl}AidDistribution/DeleteAidDistribution?id=${dist.id}`)
          .subscribe({
            next: () => {
              Swal.fire('تم الحذف!', 'تم حذف التوزيع بنجاح.', 'success');
              this.fetchDistributions();
            },
            error: () => {
              Swal.fire('خطأ', 'فشل في حذف التوزيع.', 'error');
            }
          });
      }
    });
  }

  updateDistribution(dist: any): void {
    const volunteerOptions = this.volunteers.map(v =>
      `<option value="${v.id}" ${v.id === dist.volunteerId ? 'selected' : ''}>
      ${v.firstName} ${v.lastName}
    </option>`
    ).join('');

    Swal.fire({
      title: 'تعديل بيانات التوزيع',
      html: `
      <div style="text-align:right">
        <label class="form-label mt-2">المتطوع</label>
        <select id="editVolunteerId" class="form-control">
          ${volunteerOptions}
        </select>

        <label class="form-label mt-2">الكمية</label>
        <input id="editQuantity" type="number" class="form-control" value="${dist.quantity}" min="1">

        <label class="form-label mt-2">الوصف</label>
        <textarea id="editDescription" class="form-control">${dist.description}</textarea>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: 'حفظ التعديلات',
      cancelButtonText: 'إلغاء',
      confirmButtonColor: '#007bff',
      cancelButtonColor: '#6c757d',
      preConfirm: () => {
        const volunteerInput = document.getElementById('editVolunteerId') as HTMLSelectElement;
        const quantityInput = document.getElementById('editQuantity') as HTMLInputElement;
        const descriptionInput = document.getElementById('editDescription') as HTMLTextAreaElement;

        if (!volunteerInput || !quantityInput || !descriptionInput) {
          Swal.showValidationMessage('حدث خطأ أثناء قراءة المدخلات!');
          return false;
        }

        const volunteerId = volunteerInput.value.trim();
        const quantity = +quantityInput.value;
        const description = descriptionInput.value.trim();

        if (!volunteerId || !quantity || quantity <= 0 || !description) {
          Swal.showValidationMessage('يرجى إدخال جميع الحقول بشكل صحيح');
          return false;
        }

        return { volunteerId, quantity, description };
      }
    }).then(result => {
      if (result.isConfirmed && result.value) {
        const { volunteerId, quantity, description } = result.value;

        const body = {
          id: dist.id,
          beneficiaryId: dist.beneficiaryId,
          inKindDonationId: dist.inKindDonationId,
          monetaryDonationId: dist.monetaryDonationId,
          volunteerId,
          description,
          quantity,
          amount: dist.amount,
          status: dist.status
        };

        this.http.put(`${Environment.baseUrl}${Environment.VersionUrl}AidDistribution/UpdateAidDistribution`, body)
          .subscribe({
            next: () => {
              Swal.fire('تم التحديث', 'تم تعديل بيانات التوزيع بنجاح', 'success');
              this.fetchDistributions();
            },
            error: () => {
              Swal.fire('خطأ', 'حدث خطأ أثناء التعديل', 'error');
            }
          });
      }
    });
  }

}
