import { TestBed } from '@angular/core/testing';

import { StreetviewAuthenticationService } from './streetview-authentication.service';

describe('StreetviewAuthenticationService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: StreetviewAuthenticationService = TestBed.get(StreetviewAuthenticationService);
    expect(service).toBeTruthy();
  });
});
