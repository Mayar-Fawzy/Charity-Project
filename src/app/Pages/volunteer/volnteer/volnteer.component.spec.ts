import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VolnteerComponent } from './volnteer.component';

describe('VolnteerComponent', () => {
  let component: VolnteerComponent;
  let fixture: ComponentFixture<VolnteerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VolnteerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VolnteerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
