import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'projectStatusAr',
  standalone: true
})
export class ProjectStatusArPipe implements PipeTransform {

   transform(status: any): string {
    switch (status) {
      case 1:
      case 'Ongoing':
        return 'جاري التنفيذ';
      case 'Completed':
        return 'مكتمل';
     default:
        return 'قيد الانتظار';
     
    
    }
  }

}
