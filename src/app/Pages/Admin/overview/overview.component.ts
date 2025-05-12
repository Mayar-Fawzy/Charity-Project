import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss'
})
export class OverviewComponent {

  lastUpdated = new Date();

  refreshStats() {
    this.lastUpdated = new Date(Date.now());
  }


  stats = [
    {
      title: 'التبرعات المالية',
      value: 'ج.م124,856',
      change: ' 12.5%',
      period: 'من الشهر الماضي',
      icon: 'bi bi-currency-dollar',
      iconBg: 'bg-yellow'
    },
    {
      title: 'التبرعات العينية',
      value: '2,458',
      change: ' 8.2%',
      period: 'من الشهر الماضي',
      icon: 'bi bi-gift',
      iconBg: 'bg-green'
    },
    {
      title: 'إجمالي المتطوعين',
      value: '1,287',
      change: ' 5.3%',
      period: 'من الشهر الماضي',
      icon: 'bi bi-people',
      iconBg: 'bg-blue'
    },
    {
      title: 'إجمالي المستفيدين',
      value: '3,642',
      change: ' 15.7%',
      period: 'من الشهر الماضي',
      icon: 'bi bi-person-badge',
      iconBg: 'bg-orange'
    },
    {
      title: 'المشاريع النشطة',
      value: '24',
      change: ' مشروعين جديدين',
      period: 'هذا الشهر',
      icon: 'bi bi-building',
      iconBg: 'bg-purple'
    },
    {
      title: 'إجمالي مبلغ التبرعات',
      value: 'ج.م2.4M',
      change: ' 18.3%',
      period: 'من العام الماضي',
      icon: 'bi bi-graph-up',
      iconBg: 'bg-red'
    }
  ];
}
