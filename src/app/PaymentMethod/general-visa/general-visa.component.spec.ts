import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralVisaComponent } from './general-visa.component';

describe('GeneralVisaComponent', () => {
  let component: GeneralVisaComponent;
  let fixture: ComponentFixture<GeneralVisaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeneralVisaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GeneralVisaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
