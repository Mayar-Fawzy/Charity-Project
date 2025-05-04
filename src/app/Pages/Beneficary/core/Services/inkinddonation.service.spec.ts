import { TestBed } from '@angular/core/testing';

import { InkinddonationService } from './inkinddonation.service';

describe('InkinddonationService', () => {
  let service: InkinddonationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InkinddonationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
