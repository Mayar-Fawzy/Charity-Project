import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DonorComponent } from './donor.component';

describe('DonorComponent', () => {
  let component: DonorComponent;
  let fixture: ComponentFixture<DonorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DonorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DonorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
