import { Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserStateService {
  private userImageSource = new BehaviorSubject<string>('/Images/Logo.svg');
  userImage$ = this.userImageSource.asObservable();

  updateUserImage(newImage: string) {
    this.userImageSource.next(newImage);
  }


}