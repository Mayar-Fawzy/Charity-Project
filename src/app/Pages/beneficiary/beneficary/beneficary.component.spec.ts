import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BeneficaryComponent } from './beneficary.component';

describe('BeneficaryComponent', () => {
  let component: BeneficaryComponent;
  let fixture: ComponentFixture<BeneficaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BeneficaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BeneficaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
