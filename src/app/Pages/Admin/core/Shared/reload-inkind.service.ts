import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReloadInkindService {
  private reloadInkindSubject = new Subject<void>();
  reloadInkind$ = this.reloadInkindSubject.asObservable();

  triggerReload() {
    this.reloadInkindSubject.next();
  }
}
