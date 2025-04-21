import { Data } from './../../Donor/core/interface/iproject-donate';
import { CarouselResponsiveOptions } from 'primeng/carousel';
import {
  Component,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomedonateServiesService } from '../../Donor/core/Services/homedonate-servies.service';

import { CarouselModule } from 'primeng/carousel';
import { TagModule } from 'primeng/tag';
import { RoutingModule } from '../../../core/Shared/Models/routing/routing.module';
import { ProjectFilterPipe } from '../core/pipes/project-filter.pipe';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-donor',
  standalone: true,
  imports: [CommonModule,TagModule,RoutingModule,CarouselModule,ProjectFilterPipe,FormsModule],
  templateUrl: './donor.component.html',
  styleUrl: './donor.component.scss'
})
export class DonorComponent {

  searchText: string = '';
    responsiveOptions: CarouselResponsiveOptions[] = [];
    projects:Data[]=[]
    private readonly _HomedonateServiesService=inject(HomedonateServiesService)
    GetDonation(){
      this._HomedonateServiesService.GetDonation().subscribe((res)=>{
        this.projects=res.data;
        console.log(this.projects);
      }
      )
    
    }
    
    getProgressPercentage(project: any): number {
      // نسبة وهمية مؤقتة لعرض شكل الـ UI
      const fakeCurrentAmount = project.targetAmount * 0.4; 
      return Math.round((fakeCurrentAmount / project.targetAmount) * 100);
    }
    
   
  ngOnInit(): void {
    this.responsiveOptions = [
      {
        breakpoint: '1024px',
        numVisible: 3,
        numScroll: 1
      },
      {
        breakpoint: '768px',
        numVisible: 2,
        numScroll: 1
      },
      {
        breakpoint: '560px',
        numVisible: 1,
        numScroll: 1
      }
    ];
    
    this.GetDonation()
    
  }
  
}
