import { Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserStateService {
  userImage = signal<string>('assets/images/default.png');

  userFirstName = signal<string>('');  

  setUserFirstName(name: string) {
    this.userFirstName.set(name); 
  }

  setUserImage(newImage: string) {
    this.userImage.set(newImage);
  }

  
}
