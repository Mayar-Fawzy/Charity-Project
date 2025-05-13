import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PendingItemsComponent } from './pending-items/pending-items.component';
import { AcceptItemsComponent } from './accept-items/accept-items.component';


@Component({
  selector: 'app-item-donations',
  standalone: true,
  imports: [CommonModule, PendingItemsComponent, AcceptItemsComponent],
  templateUrl: './item-donations.component.html',
  styleUrls: ['./item-donations.component.scss']
})
export class ItemDonationsComponent {

  selectedTab: 'accept' | 'pending'= 'accept';
}
