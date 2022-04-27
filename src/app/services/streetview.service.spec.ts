import { TestBed } from '@angular/core/testing';

import { StreetviewService } from './streetview.service';

describe('StreetviewService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: StreetviewService = TestBed.get(StreetviewService);
    expect(service).toBeTruthy();
  });
});
