import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EwalletPaymentComponent } from './ewallet-payment.component';

describe('EwalletPaymentComponent', () => {
  let component: EwalletPaymentComponent;
  let fixture: ComponentFixture<EwalletPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EwalletPaymentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EwalletPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
