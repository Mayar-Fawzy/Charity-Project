import { Component, inject } from '@angular/core';
import { AssreqqService } from './core/Services/assreqq.service';
import { LoginService } from '../../Pages/Auth/core/Services/login.service';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-work',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './work.component.html',
  styleUrl: './work.component.scss'
})
export class WorkComponent {
  private readonly _AssreqqService = inject(AssreqqService);
  private readonly _LoginService = inject(LoginService);
  
  requests: any[] = [];

  ngOnInit(): void {
    this._AssreqqService.GetAllAssistanceRequestsById(this._LoginService.donorId).subscribe({
      next: (res) => {
        this.requests = res.data;
        console.log(this.requests);
      },
      error: (err) => {
        console.error('Error fetching assistance requests:', err);
      }
    });
  }

  getStatusText(status: number): string {
    switch (status) {
      case 1: return 'مقبول ✅';
      case 2: return 'مرفوض ❌';
      case 3: return 'قيد الانتظار ⏳';
      default: return 'غير معروف';
    }
  }

  getStatusClass(status: number): string {
    switch (status) {
      case 1: return 'status-accepted';
      case 2: return 'status-rejected';
      case 3: return 'status-pending';
      default: return '';
    }
  }
}

