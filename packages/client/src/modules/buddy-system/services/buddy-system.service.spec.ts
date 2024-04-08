import { TestBed } from '@angular/core/testing';

import { BuddySystemService } from './buddy-system.service';

describe('BuddySystemService', () => {
  let service: BuddySystemService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BuddySystemService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
