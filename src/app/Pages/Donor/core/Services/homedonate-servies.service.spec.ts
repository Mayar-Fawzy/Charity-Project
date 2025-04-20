import { TestBed } from '@angular/core/testing';

import { HomedonateServiesService } from './homedonate-servies.service';

describe('HomedonateServiesService', () => {
  let service: HomedonateServiesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HomedonateServiesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
