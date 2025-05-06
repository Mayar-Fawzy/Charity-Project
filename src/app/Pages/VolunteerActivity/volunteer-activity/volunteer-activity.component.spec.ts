import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VolunteerActivityComponent } from './volunteer-activity.component';

describe('VolunteerActivityComponent', () => {
  let component: VolunteerActivityComponent;
  let fixture: ComponentFixture<VolunteerActivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VolunteerActivityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VolunteerActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
