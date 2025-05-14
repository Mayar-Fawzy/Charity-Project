import { TestBed } from '@angular/core/testing';

import { InkindDonationAdminService } from './inkind-donation-admin.service';

describe('InkindDonationAdminService', () => {
  let service: InkindDonationAdminService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InkindDonationAdminService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
