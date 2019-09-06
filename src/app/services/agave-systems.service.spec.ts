import { TestBed } from '@angular/core/testing';

import { AgaveSystemsService } from './agave-systems.service';

describe('AgaveSystemsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AgaveSystemsService = TestBed.get(AgaveSystemsService);
    expect(service).toBeTruthy();
  });
});
