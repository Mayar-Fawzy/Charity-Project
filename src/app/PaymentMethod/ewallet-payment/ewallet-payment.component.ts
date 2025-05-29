import { Component, OnInit, inject } from '@angular/core';
import { HomedonateServiesService } from '../../Pages/Donor/core/Services/homedonate-servies.service';
import { ActivatedRoute } from '@angular/router';
import { Data } from '../../Pages/Donor/core/interface/iproject-donate';

@Component({
  selector: 'app-ewallet-payment',
  standalone: true,
  imports: [],
  templateUrl: './ewallet-payment.component.html',
  styleUrls: ['./ewallet-payment.component.scss']
})
export class EwalletPaymentComponent implements OnInit {
  private readonly _HomedonateServiesService = inject(HomedonateServiesService);
  private readonly _ActivatedRoute = inject(ActivatedRoute);

  projects: Data[] = [];

  ngOnInit(): void {
    const projectId = this._ActivatedRoute.snapshot.paramMap.get('id');
    if (projectId) {
      this._HomedonateServiesService.getProjectById(projectId).subscribe({
        next: (res) => {
          this.projects = res.data;
        },
        error: (err) => {
          console.error('فشل في تحميل بيانات المشروع', err);
        }
      });
    }
  }
  
}
