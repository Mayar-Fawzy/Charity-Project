import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AidDistributionComponent } from './aid-distribution.component';

describe('AidDistributionComponent', () => {
  let component: AidDistributionComponent;
  let fixture: ComponentFixture<AidDistributionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AidDistributionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AidDistributionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
