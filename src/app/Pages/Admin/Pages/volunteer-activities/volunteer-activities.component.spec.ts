import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VolunteerActivitiesComponent } from './volunteer-activities.component';

describe('VolunteerActivitiesComponent', () => {
  let component: VolunteerActivitiesComponent;
  let fixture: ComponentFixture<VolunteerActivitiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VolunteerActivitiesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VolunteerActivitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
