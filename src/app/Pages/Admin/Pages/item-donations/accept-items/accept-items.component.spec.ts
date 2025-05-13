import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcceptItemsComponent } from './accept-items.component';

describe('AcceptItemsComponent', () => {
  let component: AcceptItemsComponent;
  let fixture: ComponentFixture<AcceptItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AcceptItemsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AcceptItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
