import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemDonationsComponent } from './item-donations.component';

describe('ItemDonationsComponent', () => {
  let component: ItemDonationsComponent;
  let fixture: ComponentFixture<ItemDonationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemDonationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItemDonationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
